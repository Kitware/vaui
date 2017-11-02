import _ from 'underscore';
import React, { Component } from 'react';
import { Modal, ButtonToolbar, Button, Row, Col, Glyphicon, Checkbox } from 'react-bootstrap';
import { restRequest } from 'girder/rest';

import style from './style.styl';

class ClipExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: ['root'],
            currentFolders: [],
            rootFolders: null,
            annotationFolders: new Set(),
            selectedItem: null,
            selectedFolderId: null,
            showOnlyAnnotatedClips: false
        };
        this.folderCache = new Map();
    }

    componentDidMount() {
        this.fetchFolder();
        this.getAllAnnotationFolders();
    }

    getAllFoldersAtRoot() {
        return Promise.all([
            restRequest({
                url: '/collection',
            }).then((collections) => {
                return Promise.all(collections.map((collection) => {
                    return restRequest({
                        url: 'folder',
                        data: {
                            parentType: 'collection',
                            parentId: collection._id
                        }
                    })
                }));
            })
        ]).then((results) => {
            var folders = _.flatten(results);
            return this.attachImageItem(folders);
        })
    }

    getAllAnnotationFolders() {
        // The current set of API is lacking flexible search, this is the method to get all annotated video clips (folder)
        restRequest({
            url: '/item',
            data: {
                text: '".geom.yml"'
            }
        }).then((annotationGemoetryItems) => {
            var annotationFolders = new Set(_.pluck(annotationGemoetryItems, 'folderId'));
            this.setState({ annotationFolders });
        });
    }

    tryClose() {
        this.props.onTryClose();
    }

    folderClick(folder) {
        if (!folder.imageItem) {
            this.setState({ currentFolders: [], paths: [...this.state.paths, folder._id] }, () => {
                this.fetchFolder();
            });
        } else {
            this.setState({ selectedItem: folder.imageItem, selectedFolderId: folder._id });
        }
    }

    tryGetImageItem(folderId) {
        return restRequest({
            url: '/item',
            data: {
                folderId,
                limit: 10
            }
        }).then((items) => {
            return items.filter((item) => item.largeImage)[0];
        });
    }


    loadSubFolders(folderId) {
        return restRequest({
            url: '/folder',
            data: {
                parentType: 'folder',
                parentId: folderId
            }
        }).then((folders) => {
            return this.attachImageItem(folders);
        })
    }

    attachImageItem(folders) {
        return Promise.all(
            folders.map((folder) => {
                return this.tryGetImageItem(folder._id)
                    .then((item) => {
                        folder.imageItem = item;
                        return folder;
                    })
            })
        );
    }

    fetchFolder() {
        var path = this.state.paths.slice(-1)[0];
        if (this.folderCache.has(path)) {
            this.setState({ currentFolders: this.folderCache.get(path) });
            return Promise.resolve();
        }
        var p = null;
        if (path === 'root') {
            p = this.getAllFoldersAtRoot();
        } else {
            p = this.loadSubFolders(path);
        }
        return p.then((folders) => {
            this.folderCache.set(path, folders);
            this.setState({ currentFolders: folders });
        });
    }

    backClick() {
        this.setState({
            paths: this.state.paths.slice(0, -1),
            selectedItem: null,
            selectedFolderId: null,
            currentFolders: []
        }, () => {
            this.fetchFolder();
        });

    }

    render() {
        var folders = _.sortBy(this.state.currentFolders, folder => folder.name);
        if (this.state.showOnlyAnnotatedClips) {
            folders = folders.filter((folder) => this.state.annotationFolders.has(folder._id) || !folder.imageItem);
        }
        return (
            <Modal className='v-clip-explorer' show={this.props.show} onHide={() => this.tryClose()}>
                <Modal.Header closeButton>
                    <Modal.Title>Clip Explorer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={1}><Button bsSize="xsmall" disabled={this.state.paths.length === 1} onClick={() => this.backClick()}><Glyphicon className="button back" glyph="chevron-left" /></Button></Col>
                        <Col xs={11}>
                            {folders.length !== 0 &&
                                <ul className="folders" >
                                    {
                                        folders.map((folder) => {
                                            return <li key={folder._id}
                                                onClick={(e) => this.folderClick(folder)}
                                                className={folder._id === this.state.selectedFolderId ? 'selected' : ''}
                                            >
                                                <div>
                                                    <Glyphicon className="file-icon" glyph={folder.imageItem ? 'facetime-video' : 'folder-open'} />
                                                    {folder.name}
                                                    {this.state.annotationFolders.has(folder._id) &&
                                                        <Glyphicon className="file-icon annotated-icon" title='Annotated' glyph={'tag'} />
                                                    }
                                                </div>
                                                {folder.imageItem && <div><img src={`api/v1/item/${folder.imageItem._id}/tiles/thumbnail?width=160&height=100`} /></div>}
                                            </li>;
                                        })
                                    }
                                </ul>}
                            {this.state.files && this.state.files.length === 0 &&
                                <span>Empty</span>}
                        </Col>
                    </Row>
                    <div style={{ 'text-align': 'right' }}>
                        <Checkbox className='show-only-annotated-clip'
                            checked={this.state.showOnlyAnnotatedClips}
                            onChange={() => this.setState({ showOnlyAnnotatedClips: !this.state.showOnlyAnnotatedClips })}>
                            Show only video clip with annotation
                        </Checkbox>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.tryClose()}>Cancel</Button>
                    <Button bsStyle="primary"
                        onClick={(e) => { this.props.onItemSelected(this.state.selectedItem) }}
                        disabled={!this.state.selectedItem}>Select</Button>
                </Modal.Footer>
            </Modal>
        )
    }
};

export default ClipExplorer;
