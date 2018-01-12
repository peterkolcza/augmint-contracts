/* Contract ONLY for testing */
pragma solidity 0.4.18;
import "../generic/AugmintToken.sol";


contract TokenAceMock is AugmintToken {

    function TokenAceMock(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax)
    public AugmintToken("Augmint TEST Crypto EUR", "ACET", "EUR", 4, _feeAccount, _interestPoolAccount,
        _interestEarnedAccount, _transferFeePt, _transferFeeMin, _transferFeeMax)
    {} // solhint-disable-line no-empty-blocks

    function issue(uint amount) external restrict("issue") {
        totalSupply = totalSupply.add(amount);
        balances[this] = balances[this].add(amount);
        TokenIssued(amount);
    }

    function burn(uint amount) external restrict("burn") {
        balances[this] = balances[this].sub(amount);
        totalSupply = totalSupply.sub(amount);
        TokenBurned(amount);
    }

    function withdrawTokens(address _to, uint _amount) external restrict("withdrawTokens") {
        balances[this] = balances[this].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
    }

}