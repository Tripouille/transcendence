import { HeaderView } from "./headerView";
import { MainView } from "./mainView";
import { FooterView } from "./footerView";

export const HomepageView = Backbone.View.extend({

    // headerView: new HeaderView(),
    mainView: new MainView(),
    // headerView: new FooterView(),

    render: function() {
        // this.headerView.render();
        this.$el.html(this.mainView.render().el);
        // this.footerView.render();
        return this;
    }
});