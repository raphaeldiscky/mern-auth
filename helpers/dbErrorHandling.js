'use strict'

// get unique error field name
const uniqueMessage = (error) => {
  let output
  try {
    let fieldName = error.message.split('.$')[1]
    field = field.split(' dub key')[0]
    filed = field.substring(0, field.lastIndexOf('_')) // custom error handling for useful message from mongodb, you can use for any mongodb error
    req.flash('errors', [
      {
        message: 'An account with this ' + field + 'already exists'
      }
    ])
    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'
  } catch (err) {
    output = 'already exists'
  }
  return output
}

// get error message from error object
exports.errorHandler = (error) => {
  let message = ''
  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error)
        break
      default:
        message: 'Something went wrong'
    }
  } else {
    for (let errorName in error.errorors) {
      if (error.errorors[errorName].message) {
        message = error.errorors[errorName].message
      }
    }
  }
  return message
}
