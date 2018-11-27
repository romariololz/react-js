import React, { Component } from 'react';
import RepLogs from './RepLogs';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import { getRepLogs, deleteRepLog, createRepLog } from "../api/rep_log_api";

export default class RepLogApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            highlightedRowId: null,
            repLogs: [],
            numberOfHearts: 1,
            isLoaded: false,
            isSavingNewRepLog: false,
            successMessage: '',
            newRepLogValidationErrorMessage: '',
        };

        this.succesMessageTimeoutHandle = 0;

        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleAddRepLog = this.handleAddRepLog.bind(this);
        this.handleHeartChange = this.handleHeartChange.bind(this);
        this.handleDeleteRepLog = this.handleDeleteRepLog.bind(this);
    }

    /**
     * Called right after the component is rendered to the page.
     */
    componentDidMount() {
        getRepLogs()
            .then((data) => {
                this.setState({
                    repLogs: data,
                    isLoaded: true,
                });
            });
    }

    /**
     * Called right before the component is removed from the page.
     */
    componentWillUnmount() {
        clearTimeout(this.succesMessageTimeoutHandle);
    }

    handleRowClick(repLogId) {
        this.setState({highlightedRowId: repLogId});
    }

    handleAddRepLog(item, reps) {
        const newRep = {
            reps: reps,
            item: item,
        };

        this.setState({
            isSavingNewRepLog: true,
        });

        const newState = {
            isSavingNewRepLog: false,
        };

        createRepLog(newRep)
            .then(repLog => {
                this.setState(prevState => {
                    const newRepLogs = [...prevState.repLogs, repLog];

                    return {
                        ...newState,
                        isSavingNewRepLog: false,
                        newRepLogValidationErrorMessage: '',
                    };
                });

                this.setSuccessMessage('Rep Log Saved!');
            })
            .catch(error => {
                error.response.json().then(errorsData => {
                    const errors = errorsData.errors;
                    const firstError = errors[Object.keys(errors)[0]];

                    this.setState({
                        ...newState,
                        newRepLogValidationErrorMessage: firstError,
                    });
                });
            });
    }

    setSuccessMessage(message) {
        this.setState({
           successMessage: message
        });

        clearTimeout(this.succesMessageTimeoutHandle);
        this.succesMessageTimeoutHandle = setTimeout(() => {
            this.setState({
                successMessage: ''
            });

            this.succesMessageTimeoutHandle = 0;
        }, 3000);
    }

    handleHeartChange(heartCount) {
        this.setState({
            numberOfHearts: heartCount,
        });
    }

    handleDeleteRepLog(id) {
        this.setState((prevState) => {
           return {
               repLogs: prevState.repLogs.map(repLog => {
                   if (repLog.id !== id) {
                       return repLog;
                   }

                   return { ...repLog, isDeleting: true };
               })
           }
        });

        deleteRepLog(id)
            .then(() => {
                // remove the rep log without mutating state
                // filter returns a new array
                this.setState((prevState) => {
                    return {
                        repLogs: prevState.repLogs.filter(repLog => repLog.id !== id)
                    };
                });

                this.setSuccessMessage('Item was Un-lifted');
            });
    }

    render() {
        return (
            <RepLogs
                {...this.props}
                {...this.state}
                onRowClick={this.handleRowClick}
                onAddRepLog={this.handleAddRepLog}
                onHeartChange={this.handleHeartChange}
                onDeleteRepLog={this.handleDeleteRepLog}
            />
        )
    }
}

RepLogApp.propTypes = {
    withHeart: PropTypes.bool,
    itemOptions: PropTypes.array,
};

RepLogApp.defaultProps = {
    itemOptions: []
};
