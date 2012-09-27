# MegapixImageFile for iOS

Fixes iOS6 Safari's image file rendering issue for large size image (over megapixel), which causes unexpected subsampling when drawing it in canvas, and safely renders with proper stretching.

About iOS resource limitation and subsampling, see following link:
[http://developer.apple.com/library/safari/#documentation/AppleApplications/Reference/SafariWebContent/CreatingContentforSafarioniPhone/CreatingContentforSafarioniPhone.html#//apple_ref/doc/uid/TP40006482-SW15](http://developer.apple.com/library/safari/#documentation/AppleApplications/Reference/SafariWebContent/CreatingContentforSafarioniPhone/CreatingContentforSafarioniPhone.html#//apple_ref/doc/uid/TP40006482-SW15)

Although it mainly focuses fixing iOS related issues, it can be safely used in the envionments other than iOS6.


