import { call, put, takeLatest } from 'redux-saga/effects';
import { contractsApi } from '../api/contracts';
import { jwtBearerToken } from '../helpers/headers';
import {
  REQUEST_CONTRACT,
  requestContractSuccess,
  requestContractFailure,
} from '../actions/contract';

export function* watchRequestContract() {
  yield takeLatest(REQUEST_CONTRACT, fetchContract);
}

function* fetchContract(action) {
  try {
    const result = yield call(contractsApi.contract(action.id, jwtBearerToken()));
    yield put(requestContractSuccess(result.data));
  } catch (e) {
    yield put(requestContractFailure(e));
  }
}
