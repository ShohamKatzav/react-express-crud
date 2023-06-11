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

    const addTodo = () => {
        var todoValue = document.getElementById("addTodoInput").value;
        axios
            .post(baseUrl + "/todos", { value: todoValue })
            .then((res) => {
                const newData = [...data, res.data]
                SetData(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    useEffect(getData, []);

    return (
        <>
            {data &&
                data.map((item, index) =>
                    <li key={index}>{item.todo}</li>
                )
            }
            <input type="text" name="name" id="addTodoInput" />
            <button onClick={addTodo} >Add Todo</button>
        </>
    );
}

export default List;