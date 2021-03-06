import React from 'react'
import {connect} from 'react-redux'
import {getAllBreakfasts} from '../store'
import Breakfast from './breakfast'
import Cart from './cart'
import {getCart} from '../store/cart'

class AllBreakfasts extends React.Component {
  componentDidMount() {
    this.props.getAllBreakfastsThunk()
    this.props.getCartThunk()
  }

  render() {
    return (
      <div className="allBreakfasts">
        <ul className="container">
          <h1>All breakfasts</h1>
          <div className="menuPanel">
            {this.props.breakfasts
              ? this.props.breakfasts.map(breakfast => (
                  <div className="card" key={breakfast.id}>
                    <li>
                      <Breakfast breakfast={breakfast} />
                    </li>
                  </div>
                ))
              : 'no breakfast'}
          </div>
        </ul>
        <div className="sidebar">
          <Cart breakfasts={this.props.breakfasts} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  breakfasts: state.breakfast.allBreakfasts
})

const mapDispatchToProps = dispatch => ({
  getAllBreakfastsThunk: () => dispatch(getAllBreakfasts()),
  getCartThunk: () => dispatch(getCart())
})

export default connect(mapStateToProps, mapDispatchToProps)(AllBreakfasts)
