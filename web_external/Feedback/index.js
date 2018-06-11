import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { staticRoot } from 'girder/rest';
import { FormGroup, FormControl, Radio, ControlLabel, HelpBlock } from 'react-bootstrap';

import logger from '../util/logger';
import './style.styl';

class Feedback extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            trueFalseQuestions: {
                "Was this HIT easy to understand?": null,
                "Was this HIT a good value?": null
            },
            freeformQuestions: {
                "Do you have any additional feedback to improve our HIT for MTurk?": ''
            },
            submitAttempted: false
        };
        if (props.problem) {
            this.state.trueFalseQuestions = {
                ...{
                    "Were you able to annotate this video clip?": null
                }, ...this.state.trueFalseQuestions
            };
            this.state.freeformQuestions = {
                ...{
                    "Please describe any difficulty you had completing this task": ''
                }, ...this.state.freeformQuestions
            };
        }
    }

    trueFalseQuestionAnswerChange(question, value) {
        this.setState({
            trueFalseQuestions: {
                ...this.state.trueFalseQuestions,
                ...{ [question]: value }
            }
        });
    }

    submit() {
        if (this.props.problem) {
            this.setState({
                submitAttempted: true
            });
            if ((Object.values(this.state.trueFalseQuestions)).concat((Object.values(this.state.freeformQuestions))).filter(value => !value).length === 0) {
                return logger.log('problem', { ...this.state.trueFalseQuestions, ...this.state.freeformQuestions });
            }
            return Promise.reject();
        } else {
            if ((Object.values(this.state.trueFalseQuestions)).concat((Object.values(this.state.freeformQuestions))).filter(value => value).length !== 0) {
                return logger.log('feedback', { ...this.state.trueFalseQuestions, ...this.state.freeformQuestions });
            }
            return Promise.resolve();
        }
    }

    render() {
        return <div className='b-feedback'>
            <div>
                {Object.entries(this.state.trueFalseQuestions).map(([question, answer]) => {
                    var invalid = this.state.submitAttempted && !answer;
                    return <Fragment key={question}>
                        <FormGroup validationState={invalid ? 'error' : null}>
                            <div>
                                <ControlLabel>{question}{this.props.problem && <span className='required-star'></span>}</ControlLabel>
                            </div>
                            <Radio name={question}
                                inline
                                checked={answer === 'yes'}
                                value='yes'
                                onChange={(e) => { this.trueFalseQuestionAnswerChange(question, e.target.value) }}>
                                Yes
                            </Radio>{' '}
                            <Radio name={question}
                                inline
                                checked={answer === 'no'}
                                value='no'
                                onChange={(e) => { this.trueFalseQuestionAnswerChange(question, e.target.value) }}>
                                No
                            </Radio>
                            {invalid && <HelpBlock>Required</HelpBlock>}
                        </FormGroup>
                    </Fragment>
                })}
                {Object.entries(this.state.freeformQuestions).map(([question, answer]) => {
                    var invalid = this.state.submitAttempted && !answer;
                    return <FormGroup
                        key={question}
                        controlId={question}
                        validationState={invalid ? 'error' : null}>
                        <ControlLabel>{question}{this.props.problem && <span className='required-star'></span>}</ControlLabel>
                        <FormControl
                            componentClass="textarea"
                            value={answer}
                            onChange={(e) => {
                                this.setState({
                                    freeformQuestions: {
                                        ...this.state.freeformQuestions,
                                        ...{ [question]: e.target.value }
                                    }
                                });
                            }} />
                        {invalid && <HelpBlock>Required</HelpBlock>}
                    </FormGroup>
                })}
            </div>
        </div>
    }
}

export default Feedback;
