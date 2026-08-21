# WeChat Share and External Browser Research

Tencent’s official WeChat web-development guide describes the WeChat built-in browser and its H5 APIs for functions such as sharing, scanning, and payment. Its JS-SDK reference does not document an API that launches an arbitrary shared web URL in iOS Safari or Android’s system default browser. Therefore, an ordinary LESOUL H5 page cannot reliably force WeChat to switch browsers.

The official JS-SDK documentation also states that a verified Official or Service Account must configure a JS interface security domain for H5 SDK capabilities. This is relevant only if LESOUL later uses official WeChat sharing or H5 SDK functions; it does not create an automatic external-browser launch capability.

Sources: https://developers.weixin.qq.com/doc/subscription/en/guide/h5/ and https://developers.weixin.qq.com/doc/subscription/en/guide/h5/jssdk.html
