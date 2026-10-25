package com.loopa.wallpapers;

import android.app.Activity;
import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;

public class WallpaperBridge {
    private static final String ASSET = "file:///android_asset/";
    private final Activity act;
    WallpaperBridge(Activity a) { act = a; }

    private InputStream open(String url) throws Exception {
        if (url.startsWith(ASSET)) return act.getAssets().open(url.substring(ASSET.length()));
        return new URL(url).openStream();
    }

    /** flag: 1 = home, 2 = lock, 3 = both */
    @JavascriptInterface
    public void setWallpaper(final String url, final int flag) {
        new Thread(() -> {
            try {
                InputStream in = open(url);
                Bitmap bmp = BitmapFactory.decodeStream(in);
                in.close();
                WallpaperManager wm = WallpaperManager.getInstance(act);
                int which = flag == 1 ? WallpaperManager.FLAG_SYSTEM
                        : flag == 2 ? WallpaperManager.FLAG_LOCK
                        : (WallpaperManager.FLAG_SYSTEM | WallpaperManager.FLAG_LOCK);
                wm.setBitmap(bmp, null, true, which);
                toast(flag == 1 ? "Home screen wallpaper set ✓" : flag == 2 ? "Lock screen wallpaper set ✓" : "Wallpaper set on both screens ✓");
            } catch (Exception e) { toast("Failed: " + e.getMessage()); }
        }).start();
    }

    /** Copies the video and opens Android's live wallpaper screen */
    @JavascriptInterface
    public void setLiveWallpaper(final String url) {
        new Thread(() -> {
            try {
                File out = new File(act.getFilesDir(), "live.mp4");
                try (InputStream in = open(url); OutputStream os = new FileOutputStream(out)) {
                    byte[] buf = new byte[65536]; int n;
                    while ((n = in.read(buf)) > 0) os.write(buf, 0, n);
                }
                act.getSharedPreferences("live", 0).edit().putLong("v", System.currentTimeMillis()).apply();
                act.runOnUiThread(() -> {
                    try {
                        Intent i = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
                        i.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                                new ComponentName(act, VideoWallpaperService.class));
                        act.startActivity(i);
                    } catch (Exception e) {
                        act.startActivity(new Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER));
                    }
                });
            } catch (Exception e) { toast("Failed: " + e.getMessage()); }
        }).start();
    }

    private void toast(String m) { act.runOnUiThread(() -> Toast.makeText(act, m, Toast.LENGTH_SHORT).show()); }
}
