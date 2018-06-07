import React, { PureComponent } from 'react';
import qs from 'query-string';


class FormSubmitter extends PureComponent {
    componentDidMount() {
        this.form.submit();
    }

    render() {
        var result = this.props.match.path === '/submit' ? '1' : 'problem';
        var queryParams = qs.parse(location.search);
        return <form action={`${queryParams.turkSubmitTo}/mturk/externalSubmit`}
            ref={(form) => { this.form = form; }}>
            <input type='hidden' name='assignmentId' value={queryParams.assignmentId} />
            <input type='hidden' name='result' value={result} />
        </form>;
    }
}

export default FormSubmitter;
