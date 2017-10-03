import { restRequest } from 'girder/rest';
import FileModel from 'girder/models/FileModel';
import NativeVideoWidget from '../widget/NativeVideoWidget';

import View from '../View';
import template from '../../templates/body/viewerView.pug';

import '../../stylesheets/body/viewerView.styl';

import Slider from 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.css';

const ViewerView = View.extend({
    events: {
        'click button.play': function (e) {
            this.playing = true;
            this.nativeVideoWidget.play();
            this.render();
        },
        'click button.pause': function (e) {
            this.playing = false;
            this.nativeVideoWidget.pause();
            this.render();
        }
    },
    initialize() {
        this.playing = false;
        this.nativeVideoWidget = null;
        this.slider = null;
        this.draggingSlider = false;
        restRequest({
            method: 'GET',
            url: '/file/59caaf931d0e5c4e0b9d94a1'
        }).done((file) => {
            this.fileModel = new FileModel(file);
            this.render();
        })
    },
    render() {
        this.update(template(this));
        if (this.fileModel && !this.nativeVideoWidget) {
            this.nativeVideoWidget = new NativeVideoWidget({
                parentView: this,
                el: this.$('.video'),
                model: this.fileModel,
                onPause: () => {
                    if (!this.draggingSlider) {
                        this.playing = false;
                        this.render();
                    }
                },
                onProgress: (currentTime, duration) => {
                    if (!this.draggingSlider) {
                        this.slider.setAttribute('max', parseInt(duration * 100));
                        this.slider.setValue(parseInt(currentTime * 100));
                    }
                }
            })
                .render();
        }
        if (!this.slider) {
            this.slider = new Slider(this.$('.frame-slider')[0], {
                tooltip: 'hide'
            })
                .on('slideStart', () => {
                    this.draggingSlider = true;
                    if (this.playing) {
                        this.nativeVideoWidget.pause();
                    }
                }).on('slideStop', () => {
                    this.draggingSlider = false;
                    if (this.playing) {
                        this.nativeVideoWidget.play();
                    }
                }).on('change', (e) => {
                    this.nativeVideoWidget.setTime(e.newValue / 100);
                })
        }
        return this;
    }
});
export default ViewerView;
