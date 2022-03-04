import React, { useState, useEffect, useContext } from 'react';
import {
  addContact,
  useContacts,
  updateContact,
  clearCurrent
} from '../../context/contact/ContactState';

import AlertContext from '../../context/alert/alertContext';

const initialContact = {
  name: '',
  lastname: '',
  email: '',
  phone: '',
  image: '',
};

const ContactForm = () => {
  const alertContext = useContext(AlertContext);
  const [contactState, contactDispatch] = useContacts();

  const { current } = contactState;
  const { setAlert } = alertContext;

  const [contact, setContact] = useState(initialContact);

  useEffect(() => {
    if (current !== null) {
      setContact(current);
    } else {
      setContact(initialContact);
    }
  }, [current]);

  const { name, lastname, email, phone, image } = contact;

  const isPhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  const onChange = (e) =>
    setContact({ ...contact, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (isPhone.test(phone)) {
      if (current === null) {
        addContact(contactDispatch, contact).then(() =>
          setContact(initialContact)
        );
      } else {
        updateContact(contactDispatch, contact);
      }
      clearAll();
    } else {
      setAlert('Please enter a valid phone number', 'danger');
    }
  };

  const clearAll = () => {
    clearCurrent(contactDispatch);
  };

  return (
    <form onSubmit={onSubmit}>
      <h2 className='text-primary'>
        {current ? 'Edit Contact' : 'Add Contact'}
      </h2>
      <input
        type='text'
        placeholder='First Name'
        name='name'
        value={name}
        onChange={onChange}
        required
      />
      <input
        type='text'
        placeholder='Last Name'
        name='lastname'
        value={lastname}
        onChange={onChange}
        required
      />
      <input
        type='email'
        placeholder='Email'
        name='email'
        value={email}
        onChange={onChange}
        required
      />
      <input
        type='tel'
        placeholder='Phone'
        name='phone'
        value={phone}
        onChange={onChange}
        required
      />
      <input
        type='url'
        placeholder='Image URL'
        name='image'
        value={image}
        onChange={onChange}
      />
      <div>
        <input
          type='submit'
          value={current ? 'Update Contact' : 'Add Contact'}
          className='btn btn-primary btn-block'
        />
      </div>
      {current && (
        <div>
          <button className='btn btn-light btn-block' onClick={clearAll}>
            Clear
          </button>
        </div>
      )}
    </form>
  );
};

export default ContactForm;
