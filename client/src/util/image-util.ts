export class ImageUtil {
    private static DOMAIN = 'http://res.cloudinary.com/';
    private static OTHER_PARTS = '/image/upload/';
    private static FORMAT = '.png';
    private static WIDTH = 150;

    static buildIconUrl(cloudName: string, publicId: string) {
        return ImageUtil.DOMAIN + cloudName + ImageUtil.OTHER_PARTS + 'w_' + ImageUtil.WIDTH + '/q_auto:best,c_fill,r_max/' + publicId + ImageUtil.FORMAT;
    }

    static getIconUrl(icon: { cloudName: string, publicId: string }) {
        return ImageUtil.buildIconUrl(icon.cloudName, icon.publicId);
    }

    static crateMarkerFromImg(base64: string): Promise<string> {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const square = 50;
            canvas.width = square;
            canvas.height = square;
            const context = canvas.getContext('2d');
            let img = new Image();
            img.src = base64;
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                context.drawImage(img, 0, 0, 150, 150, 0, 0, 30, 30);
                /* context.beginPath();
                 context.moveTo(15, square);  //Startpoint (x, y)
                 context.lineTo(35, square); //Point 1    (x, y)
                 context.lineTo(25, 60);  //Point 2    (x, y)
                 context.closePath();
                 const data = context.getImageData(25, square, 1, 1).data;
                 const color = '#' + ((data[0] << 16) | (data[1] << 8) | data[2]).toString(16);
                 context.fillStyle = color;
                 context.stroke();
                 context.fill();*/
                resolve(canvas.toDataURL());
            }
        });
    }
}