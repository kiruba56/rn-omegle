import { Platform } from "react-native";

// export default {
//     button_title:Platform.select({android:'Product-Sans-Bold',ios:'Product Sans Bold'}),
//     title_text:Platform.select({android:'Product-Sans-Bold',ios:'Product Sans Bold'}),
//     title_regular:Platform.select({android:'Product-Sans-Regular',ios:'ProductSans-Regular'}),
//     text_input:'Karla-Regular',
//     text_regular:'Karla-Regular',
//     text_bold:'Karla-Bold'
// };

export default {
        button_title:Platform.select({android:'sans-serif-medium',ios:'ArialHebrew-Bold'}),
        title_text:Platform.select({android:'sans-serif-medium',ios:'ArialHebrew-Bold'}),
        title_regular:Platform.select({android:'sans-serif-light',ios:'ArialHebrew-Light'}),
        text_input:Platform.select({android:'sans-serif-thin',ios:'AvenirNext-Regular'}),
        text_regular:Platform.select({android:'sans-serif-thin',ios:'AvenirNext-Regular'}),
        text_bold:Platform.select({android:'sans-serif-condensed',ios:'AvenirNext-Medium'}),
    };
    
