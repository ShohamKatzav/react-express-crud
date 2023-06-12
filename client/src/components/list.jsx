import { React, useEffect, useState, useRef } from "react";
import axios from "axios";

function List() {

    const baseUrl = "/api/v1";
    const [data, SetData] = useState([]);
    const newTodoInput = useRef("");


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
        axios
            .post(baseUrl + "/todos", { value: newTodoInput.current.value })
            .then((res) => {
                const newData = [...data, res.data]
                SetData(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const deleteTodo = (index) => {
        console.log(data[index]._id);
        axios
            .delete(baseUrl + "/todos", { data: {id: data[index]._id} })
            .then((res) => {
                const newData = [...data.filter(x => x._id != data[index]._id)]
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
                    <div key={index}>{item.todo}
                        <button onClick={() => deleteTodo(index)}>Delete Todo</button>
                    </div>
                )
            }
            <input type="text" name="name" id="addTodoInput" ref={newTodoInput} />
            <button onClick={addTodo} >Add Todo</button>
        </>
    );
}

export default List;