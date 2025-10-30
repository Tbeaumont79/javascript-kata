import axios, { AxiosError } from 'axios';
import { Response } from 'express';
import CVEModel, { ICVE } from '../models/cveModel';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function transformCveData(rawCve: any): ICVE {
    // Extract cveTags from the tags array structure
    const cveTags: string[] = [];
    if (rawCve.tags && Array.isArray(rawCve.tags)) {
        rawCve.tags.forEach((tagObj: any) => {
            if (tagObj.tags && Array.isArray(tagObj.tags)) {
                cveTags.push(...tagObj.tags);
            }
        });
    }

    return {
        cveId: rawCve.id,
        sourceIdentifier: rawCve.sourceIdentifier,
        published: rawCve.published ? new Date(rawCve.published) : undefined,
        lastModified: rawCve.lastModified ? new Date(rawCve.lastModified) : undefined,
        vulnStatus: rawCve.vulnStatus,
        cveTags: cveTags.length > 0 ? cveTags : undefined,
        descriptions: rawCve.descriptions,
        metrics: rawCve.metrics,
        weaknesses: rawCve.weaknesses,
        configurations: rawCve.configurations,
        references: rawCve.references,
    };
}

async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(url, {
                timeout: 30000, // 30 seconds timeout
            });
            return response;
        } catch (error) {
            const axiosError = error as AxiosError;

            // If rate limited (429) or connection reset, wait longer before retry
            if (axiosError.response?.status === 429 || axiosError.code === 'ECONNRESET') {
                const waitTime = attempt * 60000; // Exponential backoff: 1min, 2min, 3min
                console.log(`Rate limited or connection error. Waiting ${waitTime / 1000} seconds before retry ${attempt}/${maxRetries}...`);
                await sleep(waitTime);

                if (attempt === maxRetries) {
                    throw error;
                }
                continue;
            }

            // For other errors, throw immediately
            throw error;
        }
    }
}

export async function cveUpdateChecker(res: Response) {
    try {
        let index = 0;
        let totalProcessed = 0;

        // According to NVD API docs: 5 requests per 30 seconds without API key
        // We'll use conservative rate: 1 request every 6 seconds (10 per minute)
        const DELAY_BETWEEN_REQUESTS = 6000; // 6 seconds

        for (let i = 0; i < 159; i++) {
            console.log(`Fetching CVEs batch ${i + 1}/159 (startIndex: ${index})...`);

            try {
                const response = await fetchWithRetry(
                    `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=2000&startIndex=${index}`
                );

                if (!response.data) {
                    console.error('No data received from NVD API');
                    continue;
                }

                const rawCves = response.data.vulnerabilities?.map((vuln: any) => vuln.cve) || [];
                const transformedCves = rawCves.map((rawCve: any) => transformCveData(rawCve));

                if (transformedCves.length > 0) {
                    await CVEModel.bulkUpsert(transformedCves);
                    totalProcessed += transformedCves.length;
                    console.log(`Processed ${transformedCves.length} CVEs. Total: ${totalProcessed}`);
                }

                index += 2000;

                // Wait before next request (except for the last iteration)
                if (i < 158) {
                    await sleep(DELAY_BETWEEN_REQUESTS);
                }
            } catch (error) {
                console.error(`Error fetching batch ${i + 1}:`, error);
                // Continue with next batch instead of failing completely
                index += 2000;
                await sleep(DELAY_BETWEEN_REQUESTS * 2); // Wait longer after error
            }
        }

        return res.status(200).json({
            message: 'CVE update completed successfully',
            totalProcessed
        });
    } catch (error) {
        console.error('Fatal error in CVE update:', error);
        return res.status(500).json({
            message: 'CVE update failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}