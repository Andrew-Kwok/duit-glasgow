import UpsertForm from "@component/components/purchase/PurchaseUpsertForm";
import {constructNewPurchaseCreate} from "@component/utils/purchase";
import {useContext} from "react";
import {PersonContext} from "@component/context/PersonContext";

export default function Create() {
    const { persons } = useContext(PersonContext);

    return (
        <div className="flex justify-center bg-base-200 min-h-screen">
            <div className="max-width-screen-lg mt-8">
                <h1 className="text-xl font-bold"> Add New Purchase </h1>

                <UpsertForm initialPurchaseCreate={constructNewPurchaseCreate(persons)} />
            </div>
        </div>
    );
}