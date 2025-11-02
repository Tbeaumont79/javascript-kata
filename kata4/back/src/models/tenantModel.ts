import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
	dbUri: { type: String, required: true },
	name: { type: String, unique: true, required: true },
});

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;
