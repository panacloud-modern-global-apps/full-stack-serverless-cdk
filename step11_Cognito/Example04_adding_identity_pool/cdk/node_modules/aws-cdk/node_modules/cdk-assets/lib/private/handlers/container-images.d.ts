import { DockerImageManifestEntry } from '../../asset-manifest';
import { IAssetHandler, IHandlerHost } from '../asset-handler';
export declare class ContainerImageAssetHandler implements IAssetHandler {
    private readonly workDir;
    private readonly asset;
    private readonly host;
    private readonly localTagName;
    private readonly docker;
    constructor(workDir: string, asset: DockerImageManifestEntry, host: IHandlerHost);
    publish(): Promise<void>;
    private buildImage;
}
