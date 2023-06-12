import { React, useEffect, useState, useRef } from "react";
import axios from "axios";

function List() {

    const baseUrl = "/api/v1";
    const [data, SetData] = useState([]);
    const newTodoInput = useRef("");
    const newTodoCheckbox = useRef(false);


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
            .post(baseUrl + "/todos", { value: newTodoInput.current.value, completed: newTodoCheckbox.current.checked})
            .then((res) => {
                const newData = [...data, res.data]
                SetData(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const deleteTodo = (index) => {
        axios
            .delete(baseUrl + "/todos", { data: { id: data[index]._id } })
            .then(() => {
                const newData = [...data.filter(x => x._id != data[index]._id)]
                SetData(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const editTodo = (index,changesType) => {
        var params = { changesType: changesType, id: data[index]._id };
        if (changesType == "completed")
            params = { ...params, completed: !data[index].completed };
        else
        {
            const newTodoValue = prompt('Please enter value');
            params = { ...params, todo: newTodoValue };
        }
        axios
            .put(baseUrl + "/editTodo", params)
            .then((res) => {
                const newData =  [...data];
                newData[index] =  res.data.value;
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
                        <input type="checkbox" defaultChecked={item.completed} onChange={() => editTodo(index,"completed")} />
                        <label>Completed</label>
                        <button onClick={() => deleteTodo(index)}>Delete Todo</button>
                        <button onClick={() => editTodo(index,"todo")}>Edit Todo Text</button>
                    </div>
                )
            }
            <input type="text" ref={newTodoInput} />
            <input type="checkbox" ref={newTodoCheckbox} />
            <label>Completed?</label>
            <button onClick={addTodo} >Add Todo</button>
        </>
    );
}

export default List;