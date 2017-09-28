import { getApiRoot, restRequest } from 'girder/rest';
import View from '../View';
import template from '../../templates/widget/nativeVideoWidget.pug';

import '../../stylesheets/widget/nativeVideoWidget.styl';

const NativeVideoWidget = View.extend({
    events: {
    },
    initialize(settings) {
        this.fileModel = settings.model;
        this.onPause = settings.onPause;
        this.onProgress = settings.onProgress;
    },
    render() {
        if (!this.update(template(Object.assign({ src: `${getApiRoot()}/file/${this.fileModel.id}/download` }, this)))) {
            this.video = this.$('video')[0];
            this.video.onpause = (e) => {
                if (this.onPause) {
                    this.onPause(e);
                }
            };
            this.video.ontimeupdate = (e) => {
                this.progressChange();
            };
            this.video.onloadedmetadata = (e) => {
                this.duration = this.video.duration;
                this.progressChange();
            };
        }

        return this;
    },
    play() {
        this.video.play();
    },
    pause() {
        this.video.pause();
    },
    progressChange() {
        if (this.onProgress) {
            this.onProgress(this.video.currentTime, this.video.duration);
        }
    }
});
export default NativeVideoWidget;
