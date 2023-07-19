export const createImage = (url) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});

export function getCroppedImg(imageSrc, pixelCrop) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = imageSrc;

		image.onload = function () {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			const { width, height } = pixelCrop;

			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(
				image,
				pixelCrop.x,
				pixelCrop.y,
				width,
				height,
				0,
				0,
				width,
				height
			);

			canvas.toBlob((blob) => {
				const file = new File([blob], "croppedImage.png", {
					type: "image/png",
				});
				resolve(file);
			}, "image/png");
		};

		image.onerror = function (error) {
			reject(error);
		};
	});
}
