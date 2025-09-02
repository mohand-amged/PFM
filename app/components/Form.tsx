import {useForm, SubmitHandler} from "react-hook-form";
import React from 'react'

type Inputs = {
    name: string,
    price: number,
    billingCycle: string,
    category: string[],
    description: string
};


function Form() {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = data => {
        // Handle form submission
        console.log('Form submitted:', data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-foreground">Subscription Name</label>
                <input
                    {...register("name", { required: true })}
                    className="mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-background text-foreground"
                    placeholder="e.g., Netflix"
                />
                {errors.name && <span className="text-destructive text-sm">This field is required</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground">Price ($)</label>
                <input
                    type="number"
                    step="0.01"
                    {...register("price", { required: true, min: 0 })}
                    className="mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-background text-foreground"
                    placeholder="e.g., 9.99"
                />
                {errors.price && <span className="text-destructive text-sm">Please enter a valid price</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-foreground">Billing Cycle</label>
                <select
                    {...register("billingCycle", { required: true })}
                    className="mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-background text-foreground"
                >
                    <option value="">Select a cycle</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                </select>
                {errors.billingCycle && <span className="text-destructive text-sm">This field is required</span>}
            </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground">Category</label>
                            <select
                                {...register("category", { required: true })}
                                multiple
                                className="mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-background text-foreground"
                            ></select>
                        </div>
                    </form>
                );
}

export default Form