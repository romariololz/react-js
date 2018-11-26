/**
 * Returns a Promise object with the rep logs data
 *
 * @returns {Promise<any | never>}
 */
export function getRepLogs() {
    return fetch('/reps', {
        credentials: 'same-origin'
    })
        .then(response => {
            return response.json().then((data) => data.items);
        });
}
