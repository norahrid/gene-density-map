import React from "react";

const FileSelectionDropdown = () => (
    <div className="row justify-content-center gap-3">
        <label className="col-form-label w-auto">Genome</label>
        <select className="form-select w-auto" defaultValue="select" name="Genome Type">
            <option disabled value="select" id="select"> -- select an option -- </option>
        </select>

    </div>
)