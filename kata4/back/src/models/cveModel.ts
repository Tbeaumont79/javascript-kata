import mongoose, { Schema, Document, Model } from "mongoose";

interface IDescription {
	lang: string;
	value: string;
}

interface ICvssV2Data {
	version: string;
	vectorString: string;
	baseScore: number;
	accessVector: string;
	accessComplexity: string;
	authentication: string;
	confidentialityImpact: string;
	integrityImpact: string;
	availabilityImpact: string;
}

interface ICvssV3Data {
	version: string;
	vectorString: string;
	baseScore: number;
	baseSeverity: string;
	attackVector: string;
	attackComplexity: string;
	privilegesRequired: string;
	userInteraction: string;
	scope: string;
	confidentialityImpact: string;
	integrityImpact: string;
	availabilityImpact: string;
}

interface ICvssV4Data {
	version: string;
	vectorString: string;
	baseScore: number;
	baseSeverity: string;
	attackVector: string;
	attackComplexity: string;
	attackRequirements?: string;
	privilegesRequired: string;
	userInteraction: string;
	vulnerableSystemConfidentiality?: string;
	vulnerableSystemIntegrity?: string;
	vulnerableSystemAvailability?: string;
	subsequentSystemConfidentiality?: string;
	subsequentSystemIntegrity?: string;
	subsequentSystemAvailability?: string;
	exploitMaturity?: string;
}

interface ICvssMetric {
	source: string;
	type: "Primary" | "Secondary";
	cvssData: ICvssV2Data | ICvssV3Data | ICvssV4Data;
	baseSeverity?: string;
	exploitabilityScore?: number;
	impactScore?: number;
	acInsufInfo?: boolean;
	obtainAllPrivilege?: boolean;
	obtainUserPrivilege?: boolean;
	obtainOtherPrivilege?: boolean;
	userInteractionRequired?: boolean;
}

interface IMetrics {
	cvssMetricV2?: ICvssMetric[];
	cvssMetricV30?: ICvssMetric[];
	cvssMetricV31?: ICvssMetric[];
	cvssMetricV40?: ICvssMetric[];
}

interface IWeakness {
	source: string;
	type: string;
	description: IDescription[];
}

interface ICpeMatch {
	vulnerable: boolean;
	criteria: string;
	matchCriteriaId?: string;
	versionEndExcluding?: string;
	versionEndIncluding?: string;
	versionStartExcluding?: string;
	versionStartIncluding?: string;
}

interface IConfigurationNode {
	operator: "OR" | "AND";
	negate?: boolean;
	cpeMatch?: ICpeMatch[];
}

interface IConfiguration {
	nodes: IConfigurationNode[];
}

interface IReference {
	url: string;
	source?: string;
	tags?: string[];
}

interface ISyncMetadata {
	lastSync: Date;
	syncVersion?: string;
	syncStatus: "success" | "failed" | "pending";
}

type VulnStatus =
	| "Analyzed"
	| "Awaiting Analysis"
	| "Modified"
	| "Rejected"
	| "Undergoing Analysis"
	| "Deferred";

type Severity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ICVE extends Document {
	id: string;
	sourceIdentifier?: string;
	published?: Date;
	lastModified?: Date;
	vulnStatus?: VulnStatus;
	cveTags?: string[];
	descriptions?: IDescription[];
	metrics?: IMetrics;
	weaknesses?: IWeakness[];
	configurations?: IConfiguration[];
	references?: IReference[];

	cvssV2BaseScore?: number;
	cvssV3BaseScore?: number;
	cvssV4BaseScore?: number;
	severity?: Severity;

	syncMetadata?: ISyncMetadata;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ICVEDocument extends ICVE, Document {
	cvssScore: number | null; // Virtual property
}

// Interface du modèle avec méthodes statiques
export interface ICVEModel extends Model<ICVEDocument> {
	bulkUpsert(cves: ICVE[]): Promise<any>;
	findByProduct(vendor: string, product: string): Promise<ICVEDocument[]>;
	findBySeverity(severity: Severity, limit?: number): Promise<ICVEDocument[]>;
	findRecent(days: number): Promise<ICVEDocument[]>;
}

// Schémas Mongoose
const DescriptionSchema = new Schema<IDescription>(
	{
		lang: {
			type: String,
			required: true,
			enum: ["en", "es", "fr", "de", "ja", "zh", "ru", "pt", "it", "ko"],
		},
		value: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
);

const CvssMetricSchema = new Schema<ICvssMetric>(
	{
		source: String,
		type: {
			type: String,
			enum: ["Primary", "Secondary"],
		},
		cvssData: {
			type: Schema.Types.Mixed,
			required: true,
		},
		baseSeverity: String,
		exploitabilityScore: Number,
		impactScore: Number,
		acInsufInfo: Boolean,
		obtainAllPrivilege: Boolean,
		obtainUserPrivilege: Boolean,
		obtainOtherPrivilege: Boolean,
		userInteractionRequired: Boolean,
	},
	{ _id: false }
);

const MetricsSchema = new Schema<IMetrics>(
	{
		cvssMetricV2: [CvssMetricSchema],
		cvssMetricV30: [CvssMetricSchema],
		cvssMetricV31: [CvssMetricSchema],
		cvssMetricV40: [CvssMetricSchema],
	},
	{ _id: false }
);

const WeaknessSchema = new Schema<IWeakness>(
	{
		source: String,
		type: String,
		description: [DescriptionSchema],
	},
	{ _id: false }
);

const CpeMatchSchema = new Schema<ICpeMatch>(
	{
		vulnerable: {
			type: Boolean,
			required: true,
		},
		criteria: {
			type: String,
			required: true,
			index: true,
		},
		matchCriteriaId: String,
		versionEndExcluding: String,
		versionEndIncluding: String,
		versionStartExcluding: String,
		versionStartIncluding: String,
	},
	{ _id: false }
);

const ConfigurationNodeSchema = new Schema<IConfigurationNode>(
	{
		operator: {
			type: String,
			enum: ["OR", "AND"],
			required: true,
		},
		negate: Boolean,
		cpeMatch: [CpeMatchSchema],
	},
	{ _id: false }
);

const ConfigurationSchema = new Schema<IConfiguration>(
	{
		nodes: [ConfigurationNodeSchema],
	},
	{ _id: false }
);

const ReferenceSchema = new Schema<IReference>(
	{
		url: {
			type: String,
			required: true,
		},
		source: String,
		tags: [String],
	},
	{ _id: false }
);

const SyncMetadataSchema = new Schema<ISyncMetadata>(
	{
		lastSync: {
			type: Date,
			default: Date.now,
		},
		syncVersion: String,
		syncStatus: {
			type: String,
			enum: ["success", "failed", "pending"],
			default: "success",
		},
	},
	{ _id: false }
);

// Schéma principal CVE
const CVESchema = new Schema<ICVEDocument, ICVEModel>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		sourceIdentifier: {
			type: String,
			index: true,
		},
		published: {
			type: Date,
			index: true,
		},
		lastModified: {
			type: Date,
			index: true,
		},
		vulnStatus: {
			type: String,
			enum: [
				"Analyzed",
				"Awaiting Analysis",
				"Modified",
				"Rejected",
				"Undergoing Analysis",
				"Deferred",
			],
			index: true,
		},
		cveTags: [String],
		descriptions: [DescriptionSchema],
		metrics: MetricsSchema,
		weaknesses: [WeaknessSchema],
		configurations: [ConfigurationSchema],
		references: [ReferenceSchema],

		// Champs d'optimisation
		cvssV2BaseScore: {
			type: Number,
			index: true,
		},
		cvssV3BaseScore: {
			type: Number,
			index: true,
		},
		cvssV4BaseScore: {
			type: Number,
			index: true,
		},
		severity: {
			type: String,
			enum: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
			index: true,
		},

		syncMetadata: SyncMetadataSchema,
	},
	{
		timestamps: true,
		collection: "cves",
	}
);

// Index composés
CVESchema.index({ published: -1, severity: 1 });
CVESchema.index({ lastModified: -1 });
CVESchema.index({ vulnStatus: 1, published: -1 });
CVESchema.index({ "configurations.nodes.cpeMatch.criteria": 1 });
CVESchema.index({ sourceIdentifier: 1, published: -1 });

// Index de texte pour la recherche
CVESchema.index({
	id: "text",
	"descriptions.value": "text",
	"references.url": "text",
});

// Propriété virtuelle pour accéder au score CVSS
CVESchema.virtual("cvssScore").get(function (
	this: ICVEDocument
): number | null {
	// Priorité : CVSS v4 > v3.1 > v3.0 > v2
	if (this.cvssV4BaseScore !== undefined) return this.cvssV4BaseScore;
	if (this.cvssV3BaseScore !== undefined) return this.cvssV3BaseScore;
	if (this.cvssV2BaseScore !== undefined) return this.cvssV2BaseScore;
	return null;
});

// Middleware pre-save pour extraire les scores CVSS
CVESchema.pre<ICVEDocument>("save", function (next) {
	// Extraire CVSS v2
	if (this.metrics?.cvssMetricV2?.[0]?.cvssData) {
		const cvssData = this.metrics.cvssMetricV2[0].cvssData as ICvssV2Data;
		if (cvssData.baseScore !== undefined) {
			this.cvssV2BaseScore = cvssData.baseScore;
		}
	}

	// Extraire CVSS v3.1 (priorité sur v3.0)
	if (this.metrics?.cvssMetricV31?.[0]?.cvssData) {
		const cvssData = this.metrics.cvssMetricV31[0].cvssData as ICvssV3Data;
		if (cvssData.baseScore !== undefined) {
			this.cvssV3BaseScore = cvssData.baseScore;
		}
	} else if (this.metrics?.cvssMetricV30?.[0]?.cvssData) {
		const cvssData = this.metrics.cvssMetricV30[0].cvssData as ICvssV3Data;
		if (cvssData.baseScore !== undefined) {
			this.cvssV3BaseScore = cvssData.baseScore;
		}
	}

	// Extraire CVSS v4
	if (this.metrics?.cvssMetricV40?.[0]?.cvssData) {
		const cvssData = this.metrics.cvssMetricV40[0].cvssData as ICvssV4Data;
		if (cvssData.baseScore !== undefined) {
			this.cvssV4BaseScore = cvssData.baseScore;
		}
	}

	// Déterminer la sévérité
	const score = this.cvssScore;
	if (score !== null) {
		if (score === 0) this.severity = "NONE";
		else if (score < 4) this.severity = "LOW";
		else if (score < 7) this.severity = "MEDIUM";
		else if (score < 9) this.severity = "HIGH";
		else this.severity = "CRITICAL";
	}

	next();
});

// Méthodes statiques
CVESchema.statics.bulkUpsert = async function (cves: ICVE[]): Promise<any> {
	const bulkOps = cves.map((cve) => ({
		updateOne: {
			filter: { id: cve.id },
			update: { $set: cve },
			upsert: true,
		},
	}));

	return this.bulkWrite(bulkOps);
};

CVESchema.statics.findByProduct = async function (
	vendor: string,
	product: string
): Promise<ICVEDocument[]> {
	const cpePattern = `cpe:2.3:.:${vendor}:${product}:`;
	return this.find({
		"configurations.nodes.cpeMatch.criteria": {
			$regex: cpePattern,
			$options: "i",
		},
	});
};

CVESchema.statics.findBySeverity = async function (
	severity: Severity,
	limit: number = 100
): Promise<ICVEDocument[]> {
	return this.find({ severity }).sort({ published: -1 }).limit(limit);
};

CVESchema.statics.findRecent = async function (
	days: number
): Promise<ICVEDocument[]> {
	const dateThreshold = new Date();
	dateThreshold.setDate(dateThreshold.getDate() - days);

	return this.find({
		published: { $gte: dateThreshold },
	}).sort({ published: -1 });
};

const CVEModel = mongoose.model<ICVEDocument, ICVEModel>("CVE", CVESchema);
export default CVEModel;
