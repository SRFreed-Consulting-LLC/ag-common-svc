import { formatPercent } from '@angular/common';
import { Injectable } from '@angular/core';
import { ReportSummary } from 'ag-common-lib/public-api';
import { collection, doc, getDocs, limit, query, where, writeBatch } from 'firebase/firestore';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  constructor(public fsDao: CommonFireStoreDao<ReportSummary>){}
 
  public collection: string = "report_summaries";

  public getSummaryById(id: any): Promise<ReportSummary> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllSummariesByValue(qp: QueryParam[]): Promise<ReportSummary[]> {
    return this.fsDao.getAllByQValue(this.collection, qp);
  }

  public getAllSummaries(sortField: string): Promise<ReportSummary[]> {
    return this.fsDao.getAll(this.collection, sortField);
  }

  public createSummary(summary: ReportSummary){
    return this.fsDao.create(summary, this.collection);
  }

  public createSummaryWithId(summary: ReportSummary, id: string){
    return this.fsDao.createWithId(summary, this.collection, id);
  }

  public updateSummary(summary: ReportSummary){
    return this.fsDao.update(summary, summary.dbId, this.collection);
  }

  public deleteSummary(id: any){
    return this.fsDao.delete(id, this.collection);
  }

  public async deleteSummariesByYear(year: number, messages: String[]){
    const ref = collection(this.fsDao.db, this.collection);

    const q = query(ref, where('year', '==', year), limit(500));

    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(this.fsDao.db, q, resolve, messages).catch(reject);
    });
  }

  async deleteQueryBatch(db, query, resolve, messages) {
    const snapshot = await getDocs(query);

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve(true);
      return;
    }

    const batch = writeBatch(this.fsDao.db);

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    });
    
    await batch.commit();

    return this.deleteQueryBatch(db, query, resolve, messages);
  }

  public saveAllSummaries(summaries: ReportSummary[], messages: String[], summaryCompletionPercentage: string): Promise<boolean>{
    return new Promise(resolve => {
      messages.unshift("Importing " + summaries.length + " summaries.");

      let summaryArrays = this.chunkArray<ReportSummary>(summaries, 500);

      let summarycount: number = 1;
      
      summaryArrays.forEach(async array => {
        const batch = writeBatch(this.fsDao.db);
  
        array.forEach(summary => {
          var ref = doc(this.fsDao.db, this.collection, summary.dbId);
          batch.set(ref, {... summary});
        })
  
        await batch.commit().then(() => {            
          summaryCompletionPercentage = formatPercent(summarycount/summaryArrays.length, 'en');
  
          messages.unshift('sending summary batch ' + summarycount++ +' of ' + summaryArrays.length + ":"  + summaryCompletionPercentage);
  
          if(summarycount == summaryArrays.length){
            resolve(true)
          }
        }).catch((error) => {
          console.error('Error in Summary Service.', error);
        });
      })    
    });
  }

  chunkArray<T>(array: T[], size){
    var index = 0;
    var arrayLength = array.length;
    var tempArray: any[][] = [];
    
    for (index = 0; index < arrayLength; index += size) {
        let myChunk = array.slice(index, index+size);
        tempArray.push(myChunk);
    }

    return tempArray;
  }
}
