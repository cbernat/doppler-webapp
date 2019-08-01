import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Loading from '../../Loading/Loading';
import { InjectAppServices } from '../../../services/pure-di';
import logo from './logo.svg';
import { FormattedHTMLMessage, injectIntl, FormattedDate } from 'react-intl';
import styled from 'styled-components';
import { SubscriberListState } from '../../../services/shopify-client';

const Shopify = ({ intl, dependencies: { shopifyClient } }) => {
  const [shops, setShops] = useState([]);
  const [isConnected, setIsConnected] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const _ = (id, values) => intl.formatMessage({ id: id }, values);
  const [doPoll, setDoPoll] = useState(0);

  const ShopifyLogo = ({ className }) => (
    <img className={className} src={logo} alt="Shopify logo" />
  );
  const StyledShopifyLogo = styled(ShopifyLogo)`
    width: 80px;
    @media only screen and (max-width: 600px) {
      display: none;
    }
  `;

  const Breadcrumb = () => (
    <nav className="dp-breadcrumb">
      <ul>
        <li>
          <a href={_('common.control_panel_advanced_pref_url')}>{_('common.control_panel')}</a>
        </li>
        <li>{_('common.advanced_preferences')}</li>
      </ul>
    </nav>
  );

  const Table = ({ list }) => (
    <table className="dp-c-table">
      <thead>
        <tr>
          <th>{_('shopify.table_list')} </th>
          <th> {_('shopify.table_shopify_customers_count')}</th>
        </tr>
      </thead>
      <tbody>
        {list.state === SubscriberListState.ready ? (
          <tr>
            <td>{list.name}</td>
            <td>{list.amountSubscribers}</td>
          </tr>
        ) : (
          <tr className="sync">
            <td>{list.name}</td>
            <td className="text-sync">
              <span className="ms-icon icon-clock"></span>
              {_('common.synchronizing')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const shopifyHeader = (
    <>
      <div className="block">
        <h2>{_('shopify.header_title')}</h2>
        <p>
          <FormattedHTMLMessage id="shopify.header_subtitle" />
        </p>
      </div>
      <hr />
    </>
  );

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    const getData = async () => {
      const result = await shopifyClient.getShopifyData();
      if (!result.success) {
        setError(<FormattedHTMLMessage id="validation_messages.error_unexpected_HTML" />);
      } else if (result.value.length) {
        setIsConnected(true);
        setDoPoll(0);
        setShops(result.value);
        setError(null);
      } else {
        setIsConnected(false);
        setError(null);
        setShops(result.value);
      }
      if (!doPoll) {
        setIsLoading(false);
      }
    };
    getData();
  }, [shopifyClient, doPoll]);

  useInterval(
    () => {
      if (isLoading) {
        setDoPoll((doPoll) => doPoll + 1);
      }
    },
    !isConnected && isLoading ? 10000 : null,
  );

  return (
    <>
      <Helmet title={_('shopify.title')} />
      {/* inline styles will be removed when breadcrum is ready in ui library */}
      <section className="page-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Breadcrumb />
        <div className="dp-integration" style={{ marginTop: '20px' }}>
          {isLoading ? (
            <>
              <div className="dp-integration__block">
                {shopifyHeader}
                <div className="block"></div>
              </div>
              <Loading />
            </>
          ) : error ? (
            <>
              <div className="dp-integration__block">
                {shopifyHeader}
                <div className="block">
                  <div className="dp-msj-error bounceIn">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
              <footer className="dp-integration__actions">
                <button type="button" className="dp-button button-big primary-grey">
                  {_('common.back')}
                </button>
              </footer>
            </>
          ) : isConnected ? (
            <>
              <div className="dp-integration__block">
                {shopifyHeader}
                {shops.map((shop) => (
                  <div key={shop.shopName} className="block dp-integration__status">
                    <div className="status__info">
                      <div>
                        <StyledShopifyLogo />
                        <div className="status__data">
                          <ul>
                            <li key={shop.shopName}>
                              <p>
                                {_('shopify.header_synchronization_date')}{' '}
                                <strong>
                                  <FormattedDate value={shop.synchronization_date} timeZone="UTC" />
                                </strong>
                              </p>
                              <p>
                                {_('shopify.header_store')} <strong> {shop.shopName} </strong>
                              </p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <a
                      href={_('shopify.admin_apps_url', { shopName: shop.shopName })}
                      className="dp-button button-big primary-green"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {_('shopify.admin_apps')}
                    </a>
                  </div>
                ))}
              </div>
              <div className="dp-integration__block dp-integration--info">
                <header className="block">
                  <div>
                    <h2>{_('shopify.list_title')}</h2>
                    <p>{_('shopify.list_subtitle')}</p>
                  </div>
                  {/*<button className="dp-button button--has-icon"><span class="ms-icon icon-reload"></span></button> TODO: enable this button when ready*/}
                </header>
                <hr />
                <div className="block">
                  <ul>
                    {shops.map((shop) => (
                      <li key={shop.list.id}>
                        <Table list={shop.list} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="dp-integration__block">
                {shopifyHeader}
                <div className="block">{_('shopify.header_disconnected_warning')}</div>
              </div>

              <footer className="dp-integration__actions">
                <a
                  href={_('common.control_panel_url')}
                  className="dp-button button-big primary-grey"
                >
                  {_('common.back')}
                </a>
                <a
                  href={_('shopify.connect_url')}
                  className="dp-button button-big primary-green"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsLoading(true)}
                >
                  {_('common.connect')}
                </a>
              </footer>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default InjectAppServices(injectIntl(Shopify));
