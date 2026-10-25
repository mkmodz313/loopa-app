package com.loopa.wallpapers;

import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.service.wallpaper.WallpaperService;
import android.view.SurfaceHolder;
import java.io.File;

public class VideoWallpaperService extends WallpaperService {
    @Override public Engine onCreateEngine() { return new VideoEngine(); }

    class VideoEngine extends Engine implements SharedPreferences.OnSharedPreferenceChangeListener {
        private MediaPlayer player;
        private SurfaceHolder holder;

        @Override public void onSurfaceCreated(SurfaceHolder h) {
            super.onSurfaceCreated(h); holder = h; start();
            getSharedPreferences("live", 0).registerOnSharedPreferenceChangeListener(this);
        }

        private void start() {
            release();
            File f = new File(getFilesDir(), "live.mp4");
            if (!f.exists() || holder == null) return;
            try {
                player = new MediaPlayer();
                player.setSurface(holder.getSurface());
                player.setDataSource(f.getAbsolutePath());
                player.setLooping(true);
                player.setVolume(0f, 0f);
                player.setVideoScalingMode(MediaPlayer.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING);
                player.prepare();
                player.start();
            } catch (Exception e) { release(); }
        }

        @Override public void onSharedPreferenceChanged(SharedPreferences p, String k) { start(); }

        @Override public void onVisibilityChanged(boolean visible) {
            if (player == null) return;
            if (visible) player.start(); else player.pause();
        }

        @Override public void onSurfaceDestroyed(SurfaceHolder h) {
            getSharedPreferences("live", 0).unregisterOnSharedPreferenceChangeListener(this);
            release(); super.onSurfaceDestroyed(h);
        }

        private void release() { if (player != null) { player.release(); player = null; } }
    }
}
