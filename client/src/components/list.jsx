import { React, useEffect, useState } from "react";
import axios from "axios";

function List() {

    const baseUrl = "/api/v1";
    const [data, SetData] = useState("");


    const getData = () => {
        axios
            .get(baseUrl)
            .then((res) => {
                SetData(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    useEffect(getData, []);

    return (
        <div>{data}</div>
    );
}

export default List;