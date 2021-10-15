/* 
 * Modify from https://stackoverflow.com/questions/11524268/atob-not-working-in-ie
 */

function convertStringToBase64(input) 
{
  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

  input = input.replace(/\r\n/g,"\n");
  var utftext = "";

  for (var n = 0; n < input.length; n++) {
    var c = input.charCodeAt(n);

    if (c < 128) {
        utftext += String.fromCharCode(c);
    }
    else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
    }
    else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  input = utftext;
  
  var i = 0;
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
        enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
        enc4 = 64;
    }

    output = output +
      base64EncodeChars.charAt(enc1) + base64EncodeChars.charAt(enc2) +
      base64EncodeChars.charAt(enc3) + base64EncodeChars.charAt(enc4);
  }

  return output;
}
