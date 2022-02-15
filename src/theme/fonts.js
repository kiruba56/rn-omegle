import { Platform } from "react-native";

export default {
    button_title:Platform.select({android:'Product-Sans-Bold',ios:'Product Sans Bold'}),
    title_text:Platform.select({android:'Product-Sans-Bold',ios:'Product Sans Bold'}),
    title_regular:Platform.select({android:'Product-Sans-Regular',ios:'ProductSans-Regular'}),
    text_input:'Karla-Regular',
    text_regular:'Karla-Regular',
    text_bold:'Karla-Bold'
};

