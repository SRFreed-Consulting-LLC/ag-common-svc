import { formatPercent } from '@angular/common';
import { Injectable } from '@angular/core';
import { PolicyTransaction } from 'ag-common-lib/lib/models/domain/policy-transaction.model';
import { collection, writeBatch, getDocs, limit, query, where, doc } from 'firebase/firestore';
import { CommonFireStoreDao, QueryParam } from '../dao/CommonFireStoreDao.dao';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(public fsDao: CommonFireStoreDao<PolicyTransaction>) {}

  private collection: string = 'transactions';

  public getTransactionById(id: any): Promise<PolicyTransaction> {
    return this.fsDao.getById(this.collection, id);
  }

  public getAllTransactions(sortField?: string): Promise<PolicyTransaction[]> {
    return this.fsDao.getAll(this.collection, sortField);
  }

  public getAllTransactionsByValue(qp: QueryParam[]): Promise<PolicyTransaction[]> {
    return this.fsDao.getAllByQValue(this.collection, qp);
  }

  public createTransaction(transaction: PolicyTransaction) {
    return this.fsDao.create(transaction, this.collection);
  }

  public updateTransaction(transaction: PolicyTransaction) {
    return this.fsDao.update(transaction, transaction.dbId, this.collection);
  }

  public deleteTransaction(id: any) {
    return this.fsDao.delete(id, this.collection);
  }

  public deleteTransactionByYear(year: number, messages: String[]) {
    const ref = collection(this.fsDao.db, this.collection);

    const q = query(ref, where('year', '==', year), limit(500));

    messages.unshift('Starting to delete Transaction Records');

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
      batch.delete(doc.ref);
    });
    await batch.commit();

    return this.deleteQueryBatch(db, query, resolve, messages);
  }

  public saveAllTransactions(
    transactions: PolicyTransaction[],
    messages: String[],
    transactionCompletionPercentage: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        messages.unshift('Importing ' + transactions.length + ' transactions.');

        let transactionArrays = this.chunkArray<PolicyTransaction>(transactions, 500);

        let transactioncount: number = 1;

        transactionArrays.forEach(async (array) => {
          const batch = writeBatch(this.fsDao.db);

          array.forEach((transaction) => {
            var c = collection(this.fsDao.db, this.collection);
            var ref = doc(c);
            batch.set(ref, { ...transaction });
          });

          await batch
            .commit()
            .then(() => {
              transactionCompletionPercentage = formatPercent(transactioncount / transactionArrays.length, 'en');

              messages.unshift(
                'sending transaction batch ' +
                  transactioncount++ +
                  ' of ' +
                  transactionArrays.length +
                  ':' +
                  transactionCompletionPercentage
              );

              if (transactioncount == transactionArrays.length) {
                resolve(true);
              }
            })
            .catch((error) => {
              console.error('Error in Trasnsactions Service.', error);
            });
        });
      } catch (err) {
        console.error('Error in Trasnsactions Service.', err);
      }
    });
  }

  chunkArray<T>(array: T[], size) {
    var index = 0;
    var arrayLength = array.length;
    var tempArray: any[][] = [];

    for (index = 0; index < arrayLength; index += size) {
      let myChunk = array.slice(index, index + size);
      tempArray.push(myChunk);
    }

    return tempArray;
  }
}
