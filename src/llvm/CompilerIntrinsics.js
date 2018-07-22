/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */

import {
  Module,
  Function as LLVMFunction,
  FunctionType,
  StructType,
  Type as LLVMType,
  LinkageTypes,
  config,
} from "llvm-node";
import { llvmContext } from "./llvm-context.js";

export class Intrinsics {
  +_module: Module;
  _stringType: ?StructType;
  _uint32Type: ?StructType;
  _memcpy: ?LLVMFunction;
  _memcmp: ?LLVMFunction;
  _pow: ?LLVMFunction;

  constructor(module: Module) {
    this._module = module;
  }

  isStringType(type: LLVMType): boolean {
    if (!this._stringType) return false;
    return this._stringType.equals(type);
  }

  get stringType(): StructType {
    if (this._stringType) return this._stringType;
    let stringType = StructType.create(llvmContext, "StringType");
    let pointerType = LLVMType.getInt8PtrTy(llvmContext);
    let lengthType = LLVMType.getInt32Ty(llvmContext);
    stringType.setBody([pointerType, lengthType], false);
    this._stringType = stringType;
    return stringType;
  }

  isUint32Type(type: LLVMType): boolean {
    if (!this._uint32Type) return false;
    return this._uint32Type.equals(type);
  }

  get uint32Type(): StructType {
    if (this._uint32Type) return this._uint32Type;
    let uint32Type = StructType.create(llvmContext, "ui32");
    let int32Type = LLVMType.getInt32Ty(llvmContext);
    uint32Type.setBody([int32Type], false);
    this._uint32Type = uint32Type;
    return uint32Type;
  }

  get memcpy(): LLVMFunction {
    if (this._memcpy) return this._memcpy;
    let returnType = LLVMType.getVoidTy(llvmContext);
    let args = [
      LLVMType.getInt8PtrTy(llvmContext),
      LLVMType.getInt8PtrTy(llvmContext),
      LLVMType.getInt32Ty(llvmContext),
    ];
    if (config.LLVM_VERSION_MAJOR < 7) {
      // Alignment was removed in LLVM 7.
      args.push(LLVMType.getInt32Ty(llvmContext));
    }
    args.push(LLVMType.getInt1Ty(llvmContext));
    let fnType = FunctionType.get(returnType, args, false);
    let memcpy = LLVMFunction.create(fnType, LinkageTypes.ExternalLinkage, "llvm.memcpy.p0i8.p0i8.i32", this._module);
    this._memcpy = memcpy;
    return memcpy;
  }

  get memcmp(): LLVMFunction {
    if (this._memcmp) return this._memcmp;
    let returnType = LLVMType.getInt32Ty(llvmContext);
    let args = [
      LLVMType.getInt8PtrTy(llvmContext),
      LLVMType.getInt8PtrTy(llvmContext),
      LLVMType.getInt32Ty(llvmContext),
    ];
    let fnType = FunctionType.get(returnType, args, false);
    let memcmp = LLVMFunction.create(fnType, LinkageTypes.ExternalLinkage, "memcmp", this._module);
    this._memcmp = memcmp;
    return memcmp;
  }

  get pow(): LLVMFunction {
    if (this._pow) return this._pow;
    let returnType = LLVMType.getDoubleTy(llvmContext);
    let args = [LLVMType.getDoubleTy(llvmContext), LLVMType.getDoubleTy(llvmContext)];
    let fnType = FunctionType.get(returnType, args, false);
    let pow = LLVMFunction.create(fnType, LinkageTypes.ExternalLinkage, "llvm.pow.f64", this._module);
    this._pow = pow;
    return pow;
  }
}
