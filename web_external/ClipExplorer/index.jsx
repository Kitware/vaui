import _ from 'underscore';
import React, { Component } from 'react';
import { Modal, ButtonToolbar, Button, Row, Col, Glyphicon } from 'react-bootstrap';
import { restRequest } from 'girder/rest';

import style from './style.styl';

function cleanPath(path) {
    return `/${path.split('/').filter(segment => segment).join('/')}/`;
}

const SortDirection = {
    ascending: true,
    descending: false
}

const SortByType = {
    name: true,
    modifiedTime: false
}

class ClipExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: ['root'],
            currentFolders: [],
            rootFolders: null,
            annotationFolders: [],
            selectedItem: null,
            selectedFolderId: null
        };
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
            var rootFolders = _.flatten(results);
            return rootFolders;
        })
    }

    getAllAnnotationFolders() {
        restRequest({
            url: '/item',
            data: {
                text: '".geom.yml"'
            }
        }).then((annotationGemoetryItems) => {
            var annotationFolders = new Set(_.pluck(annotationGemoetryItems, 'folderId'));
            console.log(annotationFolders);
            this.setState({ annotationFolders });
        });
    }

    tryClose() {
        this.props.onTryClose();
    }

    folderClick(folderId) {
        this.checkIfClip(folderId)
            .then((item) => {
                if (item) {
                    this.setState({ selectedItem: item, selectedFolderId: folderId });
                } else {
                    this.setState({ currentFolders: [] });
                    this.loadSubFolders(folderId)
                        .then((folders) => {
                            this.setState({ paths: [...this.state.paths, folderId], currentFolders: folders });
                        })
                }
            })
    }

    checkIfClip(folderId) {
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
        });
    }

    fetchFolder() {
        var path = this.state.paths.slice(-1)[0];
        var p = null;
        if (path === 'root') {
            p = this.getAllFoldersAtRoot();
        } else {
            p = this.loadSubFolders(path);
        }
        p.then((folders) => {
            this.setState({ currentFolders: folders })
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
        var sortedFolders = _.sortBy(this.state.currentFolders, folder => folder.name);
        return (
            <Modal className='v-clip-explorer' show={this.props.show} onHide={() => this.tryClose()}>
                <Modal.Header closeButton>
                    <Modal.Title>Clip Explorer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="navigation-bar">
                        <Col xs={1}><Button bsSize="xsmall" disabled={this.state.paths.length === 1} onClick={() => this.backClick()}><Glyphicon className="button back" glyph="chevron-left" /></Button></Col>
                        <Col xs={11}>
                            {sortedFolders.length !== 0 &&
                                <ul className="folders" >
                                    {
                                        sortedFolders.map((folder) => {
                                            return <li key={folder._id}
                                                onClick={(e) => this.folderClick(folder._id)}
                                            >
                                                <span className={folder._id === this.state.selectedFolderId ? 'selected' : ''}>
                                                    {folder.name}
                                                    {this.state.annotationFolders.has(folder._id) &&
                                                        <Glyphicon className="file-icon" glyph={'file'} />
                                                    }
                                                </span>
                                            </li>;
                                        })
                                    }
                                </ul>}
                            {this.state.files && this.state.files.length === 0 &&
                                <span>Empty</span>}
                        </Col>
                    </Row>
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
