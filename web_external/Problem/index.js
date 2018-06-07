import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { staticRoot } from 'girder/rest';
import { FormGroup, FormControl, Radio, ControlLabel, HelpBlock } from 'react-bootstrap';

import logger from '../util/logger';
import './style.styl';

class Problem extends PureComponent {
    constructor() {
        super();
        this.state = {
            trueFalseQuestions: {
                "Were you able to annotate this video clip?": null,
                "Was this HIT easy to understand?": null,
                "Was this HIT a good value?": null
            },
            freeformQuestions: {
                "Please describe any difficulty you had completing this task": '',
                "Do you have any additional feedback to improve our HIT for MTurk?": ''
            },
            submitAttempted: false
        };
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
        this.setState({
            submitAttempted: true
        });
        if ((Object.values(this.state.trueFalseQuestions)).concat((Object.values(this.state.freeformQuestions))).filter(value => !value).length === 0) {
            return logger.log('problem', { ...this.state.trueFalseQuestions, ...this.state.freeformQuestions });
        }
        return Promise.reject();
    }

    render() {
        return <div className='b-problem'>
            {/*
                Were you able to annotate this clip? If no, please describe why.
                Was this HIT easy to understand?  If no, please suggest any improvements.
                Were there any UI interactions that were unclear?
                Are there any UI interactions that could make this task easier to complete?
                Please describe any difficulty you had completing this task.
                Was this HIT a good value?
                Do you have any additional feedback to improve our HIT for MTurk?
            */}
            <div>
                {Object.entries(this.state.trueFalseQuestions).map(([question, answer]) => {
                    var invalid = this.state.submitAttempted && !answer;
                    return <Fragment key={question}>
                        <FormGroup validationState={invalid ? 'error' : null}>
                            <div>
                                <ControlLabel>{question}<span className='required-star'></span></ControlLabel>
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
                        <ControlLabel>{question}<span className='required-star'></span></ControlLabel>
                        <FormControl
                            componentClass="textarea"
                            placeholder="textarea"
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

export default Problem;
