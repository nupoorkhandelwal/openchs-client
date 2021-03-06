import React from "react";
import {Container} from "native-base";


class CHSContainer extends Container {

    //Capuchin patch. Container does not allow custom Contents within them.
    renderContent() {
        return this.props.children;
    }
}

export default CHSContainer;