import React, { PureComponent } from 'react';
import qs from 'query-string';


class FormSubmitter extends PureComponent {
    componentDidMount() {
        this.form.submit();
    }

    render() {
        var queryParams = qs.parse(location.search);
        return <form action={`${queryParams.turkSubmitTo}/mturk/externalSubmit`}
            ref={(form) => { this.form = form; }}>
            <input type='hidden' name='assignmentId' value={queryParams.assignmentId} />
            <input type='hidden' name='result' value='1' />
        </form>;
    }
}

export default FormSubmitter;
