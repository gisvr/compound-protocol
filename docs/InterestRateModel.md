Compound-InterestRateModel合约分析

https://www.sher.vip/article/12
官网 github地址 :https://github.com/compound-finance/compound-money-market
>内部合约结构（五个内部合约）
ErrorReporter
InterestRateModel
CarefulMath
Exponential
StandardInterestRateModel
>

## ErrorReporter合约分析
>  在 price Oracle 有说明不再重复
 
### InterestRateModel合约分析
> 这是一个利率模型的抽象类，为了解耦，可以方便以后具体模型细节的更改。
```js
/**
- 函数目标: 基于总资产、总现金流、总借款额来得出当前放贷利率
- 接收参数解析
	-- asset: 代币地址
	-- cash: 合约（平台）内总的现金流
	-- borrows: 合约（平台）内总的借款额
- 返回参数解析
	-- 第一个返回值代表的是方法执行成功或失败
	-- 第二个返回值代表的是当前放贷利率，返回结果为x*10^18，要得到真实利率需除以10^18
*/
function getSupplyRate(address asset, uint cash, uint borrows) public view returns (uint, uint);

/**
- 函数目标: 基于总资产、总现金流、总借款额来得出当前借款利率
- 接收参数解析
	-- asset: 代币地址
	-- cash: 合约（平台）内总的现金流
	-- borrows: 合约（平台）内总的借款额
- 返回参数解析
	-- 第一个返回值代表的是方法执行成功或失败
	-- 第二个返回值代表的是当前借款利率，返回结果为x*10^18，要得到真实利率需除以10^18
*/
function getBorrowRate(address asset, uint cash, uint borrows) public view returns (uint, uint);

```

### CarefulMath合约分析
> 在 price Oracle 有说明不再重复


### Exponential合约分析 
> 在 price Oracle 有说明不再重复

## StandardInterestRateModel合约分析
> 这个合约内的主合约，实现了标准利率模型。
```js
contract StandardInterestRateModel is Exponential {
	uint constant oneMinusSpreadBasisPoints = 9000;//用来计算的一个基础数值
    uint constant blocksPerYear = 2102400;//每年出块数量
    uint constant mantissaFivePercent = 5 * 10**16;//表达式表示的百分之5，实际上是0.05 * 10**18

    //利率模型合约内部的错误类
    enum IRError {
        NO_ERROR,//没有错误
        FAILED_TO_ADD_CASH_PLUS_BORROWS,//计算现金+借款失败
        FAILED_TO_GET_EXP,//获取表达式失败
        FAILED_TO_MUL_PRODUCT_TIMES_BORROW_RATE//
    }

    /**
    - 函数目标: 计算联合利用率，利用率计算公式为: (borrows/(cash+borrows))
    	-- 当借款总额为0时，那利用率就是0
    - 接收参数解析:
        -- cash: 合约内总现金流
        -- borrows: 总的借款额
    */
    function getUtilizationRate(uint cash, uint borrows) pure internal returns (IRError, Exp memory)
	
    /**
    - 函数目标: 计算利用率与年借贷利率
    	-- 计算利用率: getUtilizationRate函数
    	-- 年借款利率= 0.05 + (利用率 * 0.45) = 0.05 + ((borrows/(cash+borrows)) * 0.45)
    - 接收参数解析:
        -- cash: 合约内总现金流
        -- borrows: 总的借款额
    */
    function getUtilizationAndAnnualBorrowRate(uint cash, uint borrows) pure internal returns (IRError, Exp memory, Exp memory)
    
    /**
    - 函数目标: 计算放贷利率，计算公式为放贷率 = ( (利用率 * 9000 * 年借贷利率) / (10000 * 2102400) )
    	-- 详细计算公式:
    		放贷率 = ( ((borrows/(cash+borrows)) * 9000 * ( 0.05 + ((borrows/(cash+borrows)) * 0.45))) / (10000 * 2102400) )
    - 接收参数解析:
    	-- _asset: 代币地址
        -- cash: 合约内总现金流
        -- borrows: 总的借款额
    */
    function getSupplyRate(address _asset, uint cash, uint borrows) public view returns (uint, uint)
    
    /**
    - 函数目标: 计算借贷利率，计算公式为借贷率= ( 年借款利率 / 2102400 )
    	-- 借贷率 = ( (0.05 + ((borrows/(cash+borrows)) * 0.45)) / 2102400 )
    - 接收参数解析:
    	-- _asset: 代币地址
        -- cash: 合约内总现金流
        -- borrows: 总的借款额
    */
    function getBorrowRate(address _asset, uint cash, uint borrows) public view returns (uint, uint)

```

