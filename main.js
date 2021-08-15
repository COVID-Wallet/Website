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