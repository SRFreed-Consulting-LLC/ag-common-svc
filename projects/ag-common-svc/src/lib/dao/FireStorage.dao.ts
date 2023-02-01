import { Inject, Injectable } from '@angular/core';
import FileSystemItem from 'devextreme/file_management/file_system_item';
import UploadInfo from 'devextreme/file_management/upload_info';
import { FirebaseApp } from 'firebase/app';
import {
  deleteObject,
  FirebaseStorage,
  FullMetadata,
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ListResult,
  ref,
  StorageReference,
  uploadBytes,
  uploadString,

} from 'firebase/storage';
import { FIREBASE_APP } from '../injections/firebase-app';

@Injectable({
  providedIn: 'root'
})
export class FireStorageDao {
  private storage: FirebaseStorage;

  constructor(@Inject(FIREBASE_APP) fireBaseApp: FirebaseApp) {
    this.storage = getStorage(fireBaseApp);
  }

  public getFileList(pathInfo: FileSystemItem): Promise<ListResult> {
    if (pathInfo.dataItem) {
      return listAll(ref(this.storage, pathInfo.dataItem.fullPath));
    } else {
      return listAll(ref(this.storage, pathInfo.path));
    }
  }

  public getFileMetaData(ref: StorageReference): Promise<FullMetadata> {
    return getMetadata(ref);
  }

  public createDirectory(parentDir: FileSystemItem, name: string) {
    let reference = ref(this.storage, parentDir.dataItem.fullPath + '/' + name);

    return uploadString(reference, '---do not delete me---');
  }

  public getFileURL(ref: StorageReference): Promise<string> {
    return getDownloadURL(ref);
  }

  public addFile(fileData: File, chunksInfo: UploadInfo, destinationDir: FileSystemItem) {
    return this.uploadFile(fileData, destinationDir.dataItem.fullPath + '/' + fileData.name);
  }

  public uploadFile(fileData: File, folder: string) {
    let reference = ref(this.storage, folder);

    return uploadBytes(reference, fileData);
  }

  public uploadImageFromUrl(url, folder) {
    const reference = ref(this.storage, folder);

  }

  public deleteFile(item: FileSystemItem) {
    let reference = ref(this.storage, '/' + item.dataItem.fullPath);

    return deleteObject(reference);
  }

  public deleteDirectory(item: FileSystemItem) {
    return this.getFileList(item).then((files) => {
      files.items.forEach((file) => {
        deleteObject(file.root);
      });
    });
  }
}
