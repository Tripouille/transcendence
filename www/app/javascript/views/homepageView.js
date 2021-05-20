import { HeaderView } from "./headerView";
import { MainView } from "./mainView";
import { FooterView } from "./footerView";

export const HomepageView = Backbone.View.extend({

    headerView: new HeaderView({el: $('header')}),
    mainView: new MainView({el: $('main')}),
    footerView: new FooterView({el: $('footer')}),

    render: function() {
        this.headerView.render();
        this.mainView.render();
        this.footerView.render();
        return this;
    }
});