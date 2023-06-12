import { connection } from "./jsstore_con";
import { DATA_TYPE } from "jsstore";

const getDatabase = () => {

    const tblGoods={
        name:'Goods',
        columns:{
            goods_id:{
                primaryKey:true,
                autoIncrement:false,
            },
            goods_name:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            goods_spec:{
                default:'',
                dataType: DATA_TYPE.String
            },
            goods_brand:{
                default:'',
                dataType: DATA_TYPE.String
            },
            main_unit:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            sub_unit:{
                dataType:DATA_TYPE.String,
                default:''
            }
        }
    }


    const dataBase = {
        name: "Vue_Demo",
        tables: [tblGoods]
    };
    return dataBase;
};

export const initJsStore = async () => {
    const dataBase = getDatabase();
    return await connection.initDb(dataBase);
};

