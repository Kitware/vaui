import _ from 'underscore';
import React, { Component } from 'react';
import { Modal, Button, Row, Col, Glyphicon } from 'react-bootstrap';
import { restRequest } from 'girder/rest';

import './style.styl';

class ClipExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: [{ name: 'root', folderId: 'root' }],
            currentFolders: [],
            rootFolders: null,
            annotationFolders: new Set(),
            selectedItem: null,
            selectedFolder: null,
            showMode: 'all'
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
                url: '/collection'
            }).then((collections) => {
                return Promise.all(collections.map((collection) => {
                    return restRequest({
                        url: 'folder',
                        data: {
                            parentType: 'collection',
                            parentId: collection._id,
                            limit: 0
                        }
                    });
                }));
            })
        ]).then((results) => {
            var folders = _.flatten(results);
            return this.attachImageItem(folders);
        });
    }

    getAllAnnotationFolders() {
        // The current set of API is lacking flexible search, this is the method to get all annotated video clips (folder)
        restRequest({
            url: '/item',
            data: {
                text: '".geom.yml"',
                limit: 0
            }
        }).then((annotationGemoetryItems) => {
            var annotationFolders = new Set(_.pluck(annotationGemoetryItems, 'folderId'));
            this.setState({ annotationFolders });
            return undefined;
        });
    }

    tryClose() {
        this.props.onTryClose();
    }

    folderClick(folder) {
        if (!folder.imageItem) {
            this.setState({
                paths: [...this.state.paths, { name: folder.name, folderId: folder._id }],
                currentFolders: [],
                selectedItem: null,
                selectedFolder: null
            }, () => {
                this.fetchFolder();
            });
        } else {
            this.setState({ selectedItem: folder.imageItem, selectedFolder: folder });
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
                parentId: folderId,
                limit: 0
            }
        }).then((folders) => {
            return this.attachImageItem(folders);
        });
    }

    attachImageItem(folders) {
        return Promise.all(
            folders.map((folder) => {
                return this.tryGetImageItem(folder._id)
                    .then((item) => {
                        folder.imageItem = item;
                        return folder;
                    });
            })
        );
    }

    fetchFolder() {
        var folderId = this.state.paths.slice(-1)[0].folderId;
        if (this.folderCache.has(folderId)) {
            this.setState({ currentFolders: this.folderCache.get(folderId) });
            return Promise.resolve();
        }
        var p = null;
        if (folderId === 'root') {
            p = this.getAllFoldersAtRoot();
        } else {
            p = this.loadSubFolders(folderId);
        }
        this.setState({
            loading: true
        });
        return p.then((folders) => {
            this.folderCache.set(folderId, folders);
            this.setState({
                currentFolders: folders,
                loading: false
            });
            return undefined;
        });
    }

    backClick() {
        this.setState({
            paths: this.state.paths.slice(0, -1),
            selectedItem: null,
            selectedFolder: null,
            currentFolders: []
        }, () => {
            this.fetchFolder();
        });
    }

    render() {
        var folders = _.sortBy(this.state.currentFolders, 'name');
        if (this.state.showMode !== 'all') {
            folders = folders.filter((folder) => {
                return !folder.imageItem ||
                    (this.state.showMode === 'annotated') === this.state.annotationFolders.has(folder._id);
            });
        }
        return <Modal className='v-clip-explorer' show={this.props.show} onHide={() => this.tryClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Clip Explorer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col xs={1}>
                        <Button className='back-button' bsSize='xsmall' disabled={this.state.paths.length === 1} onClick={() => this.backClick()}><Glyphicon className='button back' glyph='chevron-left' /></Button>
                    </Col>
                    <Col xs={11}>
                        <span className='location'>
                            {this.state.paths.map((path) => path.name).join(' / ')}
                        </span>
                    </Col>
                </Row>
                <Row className='folders-container'>
                    <Col xs={11} xsOffset={1}>
                        {this.state.loading && <span>Loading...</span>}
                        {!this.state.loading && folders.length === 0 && <span>Empty</span>}
                        {folders.length !== 0 &&
                            <ul className='folders' >
                                {
                                    folders.map((folder) => {
                                        return <li key={folder._id}
                                            onClick={(e) => this.folderClick(folder)}
                                            className={(this.state.selectedFolder && folder._id === this.state.selectedFolder._id) ? 'selected' : ''}
                                        >
                                            <div>
                                                <Glyphicon className='file-icon' glyph={folder.imageItem ? 'film' : 'folder-open'} />
                                                {folder.name}
                                                {this.state.annotationFolders.has(folder._id) &&
                                                    <Glyphicon className='file-icon annotated-icon' title='Annotated' glyph={'tag'} />
                                                }
                                            </div>
                                            {folder.imageItem && <div className='image-container'><img src={`api/v1/item/${folder.imageItem._id}/tiles/thumbnail?width=160&height=100`} /></div>}
                                        </li>;
                                    })
                                }
                            </ul>}
                        {this.state.files && this.state.files.length === 0 &&
                            <span>Empty</span>}
                    </Col>
                </Row>
                <Row>
                    <Col xs={11} xsOffset={1}>
                        <select value={this.state.showMode} onChange={(e) => this.setState({ showMode: e.target.value })}>
                            <option value='all'>All</option>
                            <option value='not-annotated'>Not annotated</option>
                            <option value='annotated'>Annotated</option>
                        </select>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => this.tryClose()}>Cancel</Button>
                <Button bsStyle='primary'
                    onClick={(e) => { this.props.onItemSelected(this.state.selectedFolder, this.state.selectedItem); }}
                    disabled={!this.state.selectedItem}>Select</Button>
            </Modal.Footer>
        </Modal>;
    }
}

export default ClipExplorer;
