import { React, useEffect, useState } from "react";
import axios from "axios";

function List() {

    const baseUrl = "/api/v1";
    const [data, SetData] = useState([]);


    const getData = () => {
        axios
            .get(baseUrl + "/todos")
            .then((res) => {
                SetData(res.data);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    useEffect(getData, []);

    return (
        <> 
            { data &&
                data.map((item, index) =>
                    <li key={index}>{item.todo}</li>
                )
            }
        </>
    );
}

export default List;