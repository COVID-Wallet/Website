function getOperatingSystem() {
    //  Adapted from https://stackoverflow.com/a/38241481

    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod']

    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'macOS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    }
}

switch (getOperatingSystem()) {
    case 'macOS':
        document.querySelector("#instructions-macOS").style.display = null;

        break;

    case 'iOS':
        document.querySelector("#instructions-iOS").style.display = null;

        break;

    case 'Android':
        document.querySelector("#instructions-android").style.display = null;

        break;

    default:
        document.querySelector("#instructions-generic").style.display = null;

        break;
}

document.querySelector("#image-file").value = "";
document.querySelector("#data").value = "";

async function imageDataFromSource(source) {
    const image = Object.assign(new Image(), { src: source });
    await new Promise(resolve => image.addEventListener('load', () => resolve()));
    const context = Object.assign(document.createElement('canvas'), {
        width: image.width,
        height: image.height
    }).getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
}

const restartFunction = function () {
    document.querySelector("#step1").style.display = null;
    document.querySelector("#step2").style.display = "none";
    document.querySelector("#error").style.display = "none";

    document.querySelector("#image-file").value = "";
    document.querySelector("#data").value = "";
};

document.querySelector("#retry-btn").onclick = restartFunction;
document.querySelector("#restart-btn").onclick = restartFunction;

document.querySelector("#image-file").onchange = function () {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        (async function () {
            const onError = function () {
                document.querySelector("#step1").style.display = "none";
                document.querySelector("#step2").style.display = "none";
                document.querySelector("#error").style.display = null;
            };

            const data = await imageDataFromSource(event.target.result);

            if (data == null || data.data == null) {
                onError();

                return;
            }

            const code = jsQR(data.data, data.width, data.height);

            if (code == null) {
                onError();

                return;
            }

            const qrCodeData = code.data;

            if (!qrCodeData.startsWith("HC1:")) {
                onError();

                return;
            }

            document.querySelector("#data").value = qrCodeData;

            document.querySelector("#step1").style.display = "none";
            document.querySelector("#step2").style.display = null;
            document.querySelector("#error").style.display = "none";
        })();
    });

    reader.readAsDataURL(document.querySelector("#image-file").files[0]);
};