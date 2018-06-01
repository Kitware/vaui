import { wrap } from 'girder/utilities/PluginUtils';
import ItemView from 'girder/views/body/ItemView';

wrap(ItemView, 'render', function (render) {
    this.once('g:rendered', () => {
        var assignmentId = this.model.get('meta').assignmentId;
        if(!assignmentId){
            return;
        }
        var html = `<div class="g-item-metadata">
            <div class="g-item-info-header">
                <i class="icon-info"></i>Result</div>
            <div class="g-info-list-entry"><a target="_blank" href="/#/result/${assignmentId}">${assignmentId}</a></div>
        </div>`;
        $(html).insertAfter(this.$('.g-item-metadata'));
    });
    return render.call(this);
});
