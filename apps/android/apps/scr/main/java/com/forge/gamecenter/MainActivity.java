package com.forge.gamecenter;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  @Override public void onCreate(Bundle state){
    super.onCreate(state);
    WebView web=new WebView(this);
    web.setWebViewClient(new WebViewClient());
    WebSettings s=web.getSettings();
    s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
    s.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
    web.loadUrl("file:///android_asset/index.html");
    setContentView(web);
  }
  @Override public void onBackPressed(){
    WebView web=(WebView)findViewById(android.R.id.content);
    super.onBackPressed();
  }
}
