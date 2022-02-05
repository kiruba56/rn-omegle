import { Dimensions, PixelRatio } from 'react-native';

const {width,height} = Dimensions.get('window');


const wp = widthPercent => {
    const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(width * elemWidth / 100);
};

const hp = heightPercent => {
    const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(height * elemHeight / 100);
};

export{
    wp,hp
}