import PropTypes from 'prop-types';
import { useState } from 'react';

function OracleRestDataTableFilter({ filters, setFilters, columns }) {
    const [keyInput, setKeyInput] = useState("");
    const [operatorInput, setOperatorInput] = useState("eq");
    const [valueInput, setValueInput] = useState("");
    const [editIdx, setEditIdx] = useState(null);
    const [editKey, setEditKey] = useState("");
    const [editOperator, setEditOperator] = useState("eq");
    const [editValue, setEditValue] = useState("");

    // Build key options from columns (label: col.name, value: col.sortField)
    const keyOptions = columns
        .filter(col => col.sortField)
        .map(col => ({ label: col.name, value: col.sortField, dataType: col.dataType }));

    //standard operators as documented by Oracle Rest integrations..
    const filterConditions = [
        { label: "equals", value: "eq", description: "The attribute and operator values must be identical for a match." },
        { label: "does not equal", value: "ne", description: "The attribute and operator values aren't identical." },
        { label: "contains", value: "co", description: "The entire operator value must be a substring of the attribute value for a match." },
        { label: "starts with", value: "sw", description: "The entire operator value must be a substring of the attribute value, starting at the beginning of the attribute value. This criterion is satisfied if the two strings are identical." },
        { label: "ends with", value: "ew", description: "The entire operator value must be a substring of the attribute value, matching at the end of the attribute value. This criterion is satisfied if the two strings are identical." },
        { label: "greater than", value: "gt", description: "If the attribute value is greater than operator value, there's a match. The actual comparison depends on the attribute type. For string attribute types, this is a lexicographical comparison and for DateTime types, it's a chronological comparison." },
        { label: "greater than or equal", value: "ge", description: "If the attribute value is greater than or equal to the operator value, there's a match. The actual comparison depends on the attribute type. For string attribute types, this is a lexicographical comparison and for DateTime types, it's a chronological comparison." },
        { label: "less than", value: "lt", description: "If the attribute value is less than operator value, there's a match. The actual comparison depends on the attribute type. For string attribute types, this is a lexicographical comparison and for DateTime types, it's a chronological comparison." },
        { label: "less than or equal to", value: "le", description: "If the attribute value is less than or equal to the operator value, there's a match. The actual comparison depends on the attribute type. For string attribute types, this is a lexicographical comparison and for DateTime types, it's a chronological comparison." },
    ];

    // Get dataType for current keyInput
    const currentKeyObj = keyOptions.find(opt => opt.value === keyInput);
    const currentDataType = currentKeyObj?.dataType || "string";

    const handleAdd = () => {
        if (keyInput.trim() && (operatorInput === 'pr' || valueInput.trim())) {
            setFilters(prev => {
                // Defensive: ensure prev is always an array
                const arr = Array.isArray(prev) ? prev : [];
                return [
                    ...arr,
                    {
                        key: keyInput.trim(),
                        operator: operatorInput,
                        value: valueInput.trim(),
                        dataType: currentDataType
                    }
                ];
            });
            setKeyInput("");
            setOperatorInput("eq");
            setValueInput("");
        }
    };

    const handleRemove = (idx) => {
        setFilters((prev) => prev.filter((_, i) => i !== idx));
        if (editIdx === idx) {
            setEditIdx(null);
        }
    };

    const handleEdit = (idx) => {
        setEditIdx(idx);
        setEditKey(filters[idx].key);
        setEditOperator(filters[idx].operator);
        setEditValue(filters[idx].value);
    };

    const handleEditSave = () => {
        if (editKey.trim() && (editOperator === 'pr' || editValue.trim())) {
            setFilters((prev) => prev.map((f, i) => i === editIdx ? { key: editKey.trim(), operator: editOperator, value: editValue.trim(), dataType: keyOptions.find(opt => opt.value === editKey)?.dataType || "string" } : f));
            setEditIdx(null);
        }
    };

    const handleEditCancel = () => {
        setEditIdx(null);
    };

    // Render value input based on dataType
    const renderValueInput = (value, setValue, dataType, disabled) => {
        if (dataType === 'number') {
            return (
                <input
                    className="form-control me-2"
                    style={{ maxWidth: 180 }}
                    type="number"
                    placeholder="Value"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    disabled={disabled}
                />
            );
        } else if (dataType === 'date') {
            return (
                <input
                    className="form-control me-2"
                    style={{ maxWidth: 180 }}
                    type="date"
                    placeholder="Value"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    disabled={disabled}
                />
            );
        } else {
            return (
                <input
                    className="form-control me-2"
                    style={{ maxWidth: 180 }}
                    placeholder="Value"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    disabled={disabled}
                />
            );
        }
    };

    // Defensive: ensure filters is always an array
    const safeFilters = Array.isArray(filters) ? filters : [];

    return (
        <>

        <div className="card mb-8">

            <div className="card-body">
                <div className="d-flex col mb-2 flex-wrap gap-2">
                    <select
                        className="form-select me-2"
                        style={{ minWidth: 180, maxWidth: 260 }}
                        value={keyInput}
                        onChange={e => setKeyInput(e.target.value)}
                        disabled={editIdx !== null}
                    >
                        <option value="">Key...</option>
                        {keyOptions.map(opt => (
                            <option key={opt.value} value={opt.value} style={{ whiteSpace: 'normal' }}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        className="form-select me-2"
                        style={{ minWidth: 160, maxWidth: 220 }}
                        value={operatorInput}
                        onChange={e => setOperatorInput(e.target.value)}
                        disabled={editIdx !== null}
                    >
                        {filterConditions.map(opt => (
                            <option key={opt.value} value={opt.value} style={{ whiteSpace: 'normal' }}>{opt.label}</option>
                        ))}
                    </select>
                    {operatorInput !== 'pr' && renderValueInput(valueInput, setValueInput, currentDataType, editIdx !== null)}
                    <button className="btn btn-secondary" onClick={handleAdd} type="button" disabled={editIdx !== null}>Add</button>
                </div>
                {safeFilters.length > 0 && (
                    <ul className="list-group mt-3 mb-2">
                        {safeFilters.map((f, idx) => (
                            <li className="list-group-item d-flex justify-content-between align-items-center px-2 py-1" key={idx} style={{ fontWeight: 400, fontSize: '1rem' }}>
                                {editIdx === idx ? (
                                    <div className="d-flex flex-wrap align-items-center w-100 gap-2">
                                        <select
                                            className="form-select me-2 mb-1"
                                            style={{ minWidth: 140, maxWidth: 220 }}
                                            value={editKey}
                                            onChange={e => setEditKey(e.target.value)}
                                        >
                                            <option value="">Select column...</option>
                                            {keyOptions.map(opt => (
                                                <option key={opt.value} value={opt.value} style={{ whiteSpace: 'normal' }}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="form-select me-2 mb-1"
                                            style={{ minWidth: 120, maxWidth: 180 }}
                                            value={editOperator}
                                            onChange={e => setEditOperator(e.target.value)}
                                        >
                                            {filterConditions.map(opt => (
                                                <option key={opt.value} value={opt.value} style={{ whiteSpace: 'normal' }}>{opt.label}</option>
                                            ))}
                                        </select>
                                        {editOperator !== 'pr' && renderValueInput(editValue, setEditValue, keyOptions.find(opt => opt.value === editKey)?.dataType || 'string', false)}
                                        <button className="btn btn-success btn-sm me-2 mb-1" onClick={handleEditSave} type="button">Save</button>
                                        <button className="btn btn-secondary btn-sm mb-1" onClick={handleEditCancel} type="button">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="me-2"><span style={{ fontWeight: 500 }}>{keyOptions.find(opt => opt.value === f.key)?.label || f.key}</span> <span className="text-muted">{filterConditions.find(o => o.value === f.operator)?.label || f.operator}</span> {f.value}</span>
                                        <div>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(idx)} disabled={editIdx !== null}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(idx)}>&times;</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>

        </>
    );
}

OracleRestDataTableFilter.propTypes = {
    filters: PropTypes.array.isRequired,
    setFilters: PropTypes.func.isRequired,
    columns: PropTypes.array.isRequired,
};

export default OracleRestDataTableFilter;
