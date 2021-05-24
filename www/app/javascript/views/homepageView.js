import { HeaderView } from "./headerView";
import { MainView } from "./mainView";
import { FooterView } from "./footerView";

export const HomepageView = Backbone.View.extend({

    // headerView: new HeaderView(),
    mainView: new MainView(),
    // mainView: new MainView({el: $('main')}),
    // headerView: new FooterView(),

    render: function() {
        // this.headerView.render();
        this.mainView.render();
        // this.footerView.render();
        return this;
    }
});