import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import OracleRestDataTableFilter from './OracleRestDataTableFilter';
function Download({ onDownload }) {
    return (
        <button className="btn btn-outline-secondary d-flex align-items-center" onClick={onDownload} title="Download CSV">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-download me-1" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5V13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.6a.5.5 0 0 1 1 0V13a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.6a.5.5 0 0 1 .5-.5z" />
                <path d="M7.646 10.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 9.293V1.5a.5.5 0 0 0-1 0v7.793L5.354 7.146a.5.5 0 1 0-.708.708l3 3z" />
            </svg>

        </button>
    );
}
Download.propTypes = { onDownload: PropTypes.func.isRequired };


function OracleRestDataTable({ dataTableTitle, url, columns, defaultPageSize = 25 }) {
    const [data, setData] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pending, setPending] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultPageSize);
    const [filters, setFilters] = useState([]); // Fix: ensure filters is always an array, not an object

    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const buildFilterString = (filters) => {
        if (!Array.isArray(filters) || filters.length === 0) return '';
        return filters.map(f => {
            const operator = f.operator || 'eq'; // Default to 'equals' if no operator is provided
            const value = encodeURIComponent(f.value || '');
            //TODO build this to be similar to the oracle rest api filters syntax
            return `filters=${f.key} ${operator} ${value}`;
        }).join('&');
    }
    const fetchData = useCallback(async (page, perPage, filters) => {
        setPending(true);
        const offset = (page - 1) * perPage;
        //offset , limit, and total results are standard query parameters for pagination with oracle rest data tables
        let apiUrl = `${url}?offset=${offset}&limit=${perPage}&totalResults=true`;
        if (filters && filters.length > 0) {
           const filterString = buildFilterString(filters);
           apiUrl += `&${filterString}`;
        }
        try {
            const response = await fetch(apiUrl);
            const json = await response.json();
            setData(json.items || []);
            setTotalRows(json.count || 0);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch data:', e);
            setData([]);
            setTotalRows(0);
        } finally {
            setPending(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData(page, perPage, filters);
    }, [fetchData, page, perPage, filters]);

    const handlePageChange = page => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPerPage(newPerPage);
        setPage(page);
    };

    const exportDataToCsv = React.useMemo(
        () => <Download onDownload={() => downloadCSV(fetchData(1, totalRows, null), columns)} />, [data, columns]
    );

    const [showFilterModal, setShowFilterModal] = useState(false);

    // Move handleFilterSearch above filterButton so it is defined before use
    const handleFilterSearch = () => {

        setShowFilterModal(false);

        setPage(1);
        setResetPaginationToggle(t => !t);
        fetchData(1, perPage, filters);
    };

    const filterButton = (
        <>
            <button
                className="btn btn-outline-secondary d-flex align-items-center me-2"
                title="Filter"
                onClick={() => setShowFilterModal(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-funnel me-1" viewBox="0 0 16 16">
                    <path d="M1.5 1.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .39.812l-4.607 5.76A1.5 1.5 0 0 0 9 9.5v3.793l-2 1V9.5a1.5 1.5 0 0 0-.283-.928L2.11 1.812A.5.5 0 0 1 1.5 1.5z" />
                </svg>

            </button>
            {showFilterModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">                <span className="d-flex align-items-center" style={{ color: 'black' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16">
                                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .39.812l-4.573 5.715A1.5 1.5 0 0 0 9 9.385V13.5a.5.5 0 0 1-.724.447l-2-1A.5.5 0 0 1 6 12.5V9.385a1.5 1.5 0 0 0-.817-1.858L.61 1.812A.5.5 0 0 1 1.5 1.5z" />
                                    </svg>
                                </span></h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowFilterModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <OracleRestDataTableFilter
                                    filters={filters}
                                    setFilters={setFilters}
                                    columns={columns}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleFilterSearch}>
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
    // Update Search button in modal to fetch with filters


    function downloadCSV(data, columns) {
        const csvRows = [];
        // headers
        const headers = columns.map(col => col.name);
        csvRows.push(headers.join(','));
        // rows
        for (const row of data) {
            const values = columns.map(col => {
                const val = typeof col.selector === 'function' ? col.selector(row) : row[col.selector];
                // Escape quotes
                return '"' + String(val).replace(/"/g, '""') + '"';
            });
            csvRows.push(values.join(','));
        }
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${dataTableTitle}-data.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Helper to build a human-readable label for each filter
    const getFilterLabel = (f) => {
        const colObj = columns.find(col => col.sortField === f.key);
        const operatorObj = [
            { label: "equals", value: "eq" },
            { label: "does not equal", value: "ne" },
            { label: "contains", value: "co" },
            { label: "starts with", value: "sw" },
            { label: "ends with", value: "ew" },
            { label: "greater than", value: "gt" },
            { label: "greater than or equal", value: "ge" },
            { label: "less than", value: "lt" },
            { label: "less than or equal to", value: "le" },
        ].find(o => o.value === f.operator);
        return `${colObj?.name || f.key} ${operatorObj?.label || f.operator}${f.value ? ` ${f.value}` : ''}`;
    };

    // Render filter badges as a subheader row
    const filterBadges = Array.isArray(filters) && filters.length > 0 && (
        <div className="mb-2 d-flex flex-wrap gap-2 align-items-center">
            {filters.map((f, idx) => (
                <span key={idx} className="badge bg-primary d-flex align-items-center px-2 py-1">
                    <span className="me-1">{getFilterLabel(f)}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-close btn-close-white ms-1 p-0"
                        style={{ fontSize: '0.7rem' }}
                        aria-label="Remove"
                        onClick={() => setFilters(prev => prev.filter((_, i) => i !== idx))}
                    ></button>
                </span>
            ))}
        </div>
    );

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <DataTable

                        striped
                        className="data-table"
                        columns={columns}
                        fixedHeader
                        fixedSubHeader
                        highlightOnHover
                        data={data}
                        progressPending={pending}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                        paginationRowsPerPageOptions={[25, 50, 100, 500]}
                        title={
                            <>
                                <h2 className="text-secondary d-flex justify-content-start">{dataTableTitle} <div style={{ padding: '0 0.5rem' }}>{filterButton}</div></h2>
                            </>
                        }
                        subHeader
                        subHeaderComponent={filterBadges}
                        subHeaderAlign="left"
                        subHeaderWrap={true}
                        actions={[exportDataToCsv]}
                        onRowClicked={row => console.log('Row clicked:', row)}
                        paginationResetDefaultPage={resetPaginationToggle}
                    />
                </div>
            </div>
        </>
    );
}


OracleRestDataTable.propTypes = {
    dataTableTitle: PropTypes.string,
    url: PropTypes.string.isRequired,
    columns: PropTypes.array,
    defaultPageSize: PropTypes.number,
};

export default OracleRestDataTable;
